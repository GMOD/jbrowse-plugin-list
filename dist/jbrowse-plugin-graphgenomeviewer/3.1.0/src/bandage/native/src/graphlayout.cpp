// Copyright 2017 Ryan Wick
// Copyright 2022 Anton Korobeynikov
// Copyright 2024 Bandage Layout JS Port

// This file is part of Bandage

// Bandage is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

#include "../include/graphlayout.h"
#include "../include/settings.h"

#include "ogdf/basic/GraphCopy.h"
#include "ogdf/basic/simple_graph_alg.h"
#include "ogdf/energybased/FMMMLayout.h"
#include "ogdf/energybased/fmmm/MAARPacking.h"
#include "ogdf/energybased/FastMultipoleEmbedder.h"
#include "ogdf/energybased/fmmm/FMMMOptions.h"

#include <ctime>
#include <cmath>
#include <algorithm>
#include <set>

using namespace ogdf;
using namespace ogdf::energybased;

// OGDF node storage for layout
using OGDFGraphLayout = std::unordered_map<DeBruijnNode*, std::vector<ogdf::node>>;

// FMM layout implementation
class FMMGraphLayout {
public:
    FMMGraphLayout(int graphLayoutQuality, bool keepPositions,
                   double graphLayoutComponentSeparation, double aspectRatio,
                   int randomSeed, bool rotateComponents)
        : m_graphLayoutQuality(graphLayoutQuality),
          m_keepPositions(keepPositions),
          m_graphLayoutComponentSeparation(graphLayoutComponentSeparation),
          m_aspectRatio(aspectRatio),
          m_randomSeed(randomSeed),
          m_rotateComponents(rotateComponents) {
        init();
    }

    void init() {
        // Seeded rather than clock()-seeded so the same graph always lays out
        // the same way. RandomRandIterNr is the placement mode that draws from
        // randSeed(); RandomTime reseeds from time(nullptr) and ignores it,
        // which is what made every force-directed figure jitter 2% between
        // regens (OGDF FMMMLayout::create_initial_placement).
        m_layout.randSeed(m_randomSeed);
        m_layout.useHighLevelOptions(false);
        m_layout.unitEdgeLength(1.0);
        m_layout.allowedPositions(ogdf::FMMMOptions::AllowedPositions::All);
        m_layout.pageRatio(m_aspectRatio);
        m_layout.minDistCC(m_graphLayoutComponentSeparation);
        // FMMM packs even a single component, and the packing may tip it 90
        // degrees; with seeds that would undo the orientation they stated.
        m_layout.stepsForRotatingComponents(m_rotateComponents ? 50 : 0);
        if (!m_rotateComponents) {
            m_layout.tipOverCCs(ogdf::FMMMOptions::TipOver::None);
        }
        m_layout.initialPlacementForces(m_keepPositions ?
                                       ogdf::FMMMOptions::InitialPlacementForces::KeepPositions :
                                       ogdf::FMMMOptions::InitialPlacementForces::RandomRandIterNr);

        switch (m_graphLayoutQuality) {
            case 0:
                m_layout.fixedIterations(3);
                m_layout.fineTuningIterations(1);
                m_layout.nmPrecision(2);
                break;
            case 1:
                m_layout.fixedIterations(15);
                m_layout.fineTuningIterations(10);
                m_layout.nmPrecision(2);
                break;
            case 2:
                m_layout.fixedIterations(30);
                m_layout.fineTuningIterations(20);
                m_layout.nmPrecision(4);
                break;
            case 3:
                m_layout.fixedIterations(60);
                m_layout.fineTuningIterations(40);
                m_layout.nmPrecision(6);
                break;
            case 4:
                m_layout.fixedIterations(120);
                m_layout.fineTuningIterations(60);
                m_layout.nmPrecision(8);
                break;
        }
    }

    void run(GraphAttributes& GA, const EdgeArray<double>& edges) {
        m_layout.call(GA, edges);
    }

private:
    int m_graphLayoutQuality;
    bool m_keepPositions;
    double m_graphLayoutComponentSeparation;
    double m_aspectRatio;
    int m_randomSeed;
    bool m_rotateComponents;
    FMMMLayout m_layout;
};

static void addToOgdfGraph(DeBruijnNode* node,
                          Graph& ogdfGraph, GraphAttributes& GA,
                          EdgeArray<double>& edgeLengths,
                          OGDFGraphLayout& layout,
                          const LayoutSettings* settings,
                          double xPos, double yPos, bool linearLayout) {
    if (layout.find(node) != layout.end() ||
        (node->getReverseComplement() &&
         layout.find(node->getReverseComplement()) != layout.end()))
        return;

    double drawnNodeLength = getDrawnNodeLength(settings, node->getLength());
    int numberOfGraphEdges = getNumberOfOgdfGraphEdges(settings, drawnNodeLength);
    int numberOfGraphNodes = numberOfGraphEdges + 1;
    double drawnLengthPerEdge = drawnNodeLength / numberOfGraphEdges;

    // A seeded chain starts where the caller put it and spans exactly its
    // drawn length, so seeds laid end to end meet. The linear layout keeps its
    // own nodeSegmentLength step: that path is what every linear figure was
    // drawn with.
    bool seeded = !linearLayout && node->hasSeed();
    if (seeded) {
        xPos = node->seedX;
        yPos = node->seedY;
    }

    ogdf::node newNode;
    ogdf::node previousNode = nullptr;
    for (int i = 0; i < numberOfGraphNodes; ++i) {
        newNode = ogdfGraph.newNode();
        layout[node].push_back(newNode);

        if (linearLayout) {
            GA.x(newNode) = xPos;
            GA.y(newNode) = yPos;
            xPos += settings->nodeSegmentLength;
        } else if (seeded) {
            GA.x(newNode) = xPos;
            GA.y(newNode) = yPos;
            xPos += drawnLengthPerEdge;
        }

        GA.width(newNode) = settings->edgeLength;
        GA.height(newNode) = settings->edgeLength;

        if (i > 0) {
            ogdf::edge newEdge = ogdfGraph.newEdge(previousNode, newNode);
            edgeLengths[newEdge] = drawnLengthPerEdge;
        }

        previousNode = newNode;
    }
}

static void addToOgdfGraph(const DeBruijnEdge* edge,
                          Graph& ogdfGraph, EdgeArray<double>& edgeArray,
                          const OGDFGraphLayout& layout,
                          const LayoutSettings* settings) {
    ogdf::node firstEdgeOgdfNode;
    ogdf::node secondEdgeOgdfNode;

    const auto* startingNode = edge->getStartingNode();
    auto startIt = layout.find(const_cast<DeBruijnNode*>(startingNode));
    auto startRcIt = startingNode->getReverseComplement() ?
                     layout.find(startingNode->getReverseComplement()) : layout.end();

    if (startIt != layout.end())
        firstEdgeOgdfNode = startIt->second.back();
    else if (startRcIt != layout.end())
        firstEdgeOgdfNode = startRcIt->second.front();
    else
        return;

    const auto* endingNode = edge->getEndingNode();
    auto endIt = layout.find(const_cast<DeBruijnNode*>(endingNode));
    auto endRcIt = endingNode->getReverseComplement() ?
                   layout.find(endingNode->getReverseComplement()) : layout.end();

    if (endIt != layout.end())
        secondEdgeOgdfNode = endIt->second.front();
    else if (endRcIt != layout.end())
        secondEdgeOgdfNode = endRcIt->second.back();
    else
        return;

    if (startingNode == endingNode &&
        getNumberOfOgdfGraphEdges(settings,
                                 getDrawnNodeLength(settings, startingNode->getLength())) == 1)
        return;

    ogdf::edge newEdge = ogdfGraph.newEdge(firstEdgeOgdfNode, secondEdgeOgdfNode);
    edgeArray[newEdge] = settings->edgeLength;
}

static void determineLinearNodePositions(Graph& ogdfGraph,
                                        GraphAttributes& ogdfGraphAttributes,
                                        EdgeArray<double>& ogdfEdgeLengths,
                                        OGDFGraphLayout& layoutMap,
                                        const AssemblyGraph& graph,
                                        const LayoutSettings* settings) {
    std::vector<DeBruijnNode*> sortedDrawnNodes;

    // Try numeric sorting first. A pggb or odgi graph numbers its segments, so
    // `10` sorts after `9` rather than before it; anything else — minigraph's
    // `s1`, a named contig — falls through to the alphabetical pass below.
    std::vector<std::pair<int, DeBruijnNode*>> numericallySortedNodes;
    bool successfulIntConversion = true;

    for (const auto& pair : graph.nodes) {
        DeBruijnNode* node = pair.second;
        if (!node->isDrawn())
            continue;

        std::optional<int> nodeInt = parseWholeInt(node->getNameWithoutSign());
        if (!nodeInt) {
            successfulIntConversion = false;
            break;
        }
        numericallySortedNodes.push_back({*nodeInt, node});
    }

    if (successfulIntConversion) {
        std::sort(numericallySortedNodes.begin(), numericallySortedNodes.end(),
                 [](const auto& a, const auto& b) { return a.first < b.first; });
        for (const auto& entry : numericallySortedNodes)
            sortedDrawnNodes.push_back(entry.second);
    } else {
        // Alphabetical sorting
        for (const auto& pair : graph.nodes) {
            if (pair.second->isDrawn())
                sortedDrawnNodes.push_back(pair.second);
        }
        std::sort(sortedDrawnNodes.begin(), sortedDrawnNodes.end(),
                 [](const DeBruijnNode* a, const DeBruijnNode* b) {
                     return a->getNameWithoutSign() < b->getNameWithoutSign();
                 });
    }

    // Add nodes with initial positions
    std::set<std::pair<long long, long long>> usedStartPositions;
    double lastXPos = 0.0;

    for (auto* node : sortedDrawnNodes) {
        if (layoutMap.find(node) != layoutMap.end() ||
            (node->getReverseComplement() &&
             layoutMap.find(node->getReverseComplement()) != layoutMap.end()))
            continue;

        std::vector<DeBruijnNode*> upstreamNodes = node->getUpstreamNodes();
        for (size_t j = 0; j < upstreamNodes.size(); ++j) {
            DeBruijnNode* upstreamNode = upstreamNodes[j];
            auto it = layoutMap.find(upstreamNode);
            if (it == layoutMap.end())
                continue;

            ogdf::node upstreamEnd = it->second.back();
            double upstreamEndPos = ogdfGraphAttributes.x(upstreamEnd);
            if (j == 0)
                lastXPos = upstreamEndPos;
            else
                lastXPos = std::max(lastXPos, upstreamEndPos);
        }

        double xPos = lastXPos + settings->edgeLength;
        double yPos = 0.0;
        long long intXPos = (long long)(xPos * 100.0);
        long long intYPos = (long long)(yPos * 100.0);

        while (usedStartPositions.find({intXPos, intYPos}) != usedStartPositions.end()) {
            yPos += settings->edgeLength;
            intYPos = (long long)(yPos * 100.0);
        }

        addToOgdfGraph(node, ogdfGraph, ogdfGraphAttributes, ogdfEdgeLengths,
                      layoutMap, settings, xPos, yPos, true);
        usedStartPositions.insert({intXPos, intYPos});
        lastXPos = ogdfGraphAttributes.x(layoutMap[node].back());
    }
}

static void buildGraph(Graph& ogdfGraph,
                      GraphAttributes& ogdfGraphAttributes,
                      EdgeArray<double>& ogdfEdgeLengths,
                      OGDFGraphLayout& layoutMap,
                      const AssemblyGraph& graph,
                      const LayoutSettings* settings,
                      bool useLinearLayout) {
    if (useLinearLayout) {
        determineLinearNodePositions(ogdfGraph, ogdfGraphAttributes, ogdfEdgeLengths,
                                    layoutMap, graph, settings);
    } else {
        for (const auto& pair : graph.nodes) {
            DeBruijnNode* node = pair.second;
            if (!node->isDrawn() ||
                layoutMap.find(node) != layoutMap.end() ||
                (node->getReverseComplement() &&
                 layoutMap.find(node->getReverseComplement()) != layoutMap.end()))
                continue;

            addToOgdfGraph(node, ogdfGraph, ogdfGraphAttributes, ogdfEdgeLengths,
                          layoutMap, settings, 0.0, 0.0, false);
        }
    }

    // Add edges
    for (const DeBruijnEdge* edge : graph.edges) {
        if (!edge->isDrawn())
            continue;

        if (edge->getOverlapType() == JUMP || edge->getOverlapType() == EXTRA_LINK)
            continue;

        addToOgdfGraph(edge, ogdfGraph, ogdfEdgeLengths, layoutMap, settings);
    }
}

// Rectangle calculation and packing helpers
static fmmm::Rectangle calculateBoundingRectangle(const GraphAttributes& GA,
                                                  const List<ogdf::node>& nodesInCC,
                                                  double componentSeparation,
                                                  int componentIndex) {
    ogdf::node first = nodesInCC.front();
    fmmm::Rectangle r;

    double max_boundary = std::max(GA.width(first) / 2, GA.height(first) / 2);
    double x_min = GA.x(first) - max_boundary;
    double x_max = GA.x(first) + max_boundary;
    double y_min = GA.y(first) - max_boundary;
    double y_max = GA.y(first) + max_boundary;

    for (ogdf::node v : nodesInCC) {
        max_boundary = std::max(GA.width(v) / 2, GA.height(v) / 2);
        double act_x_min = GA.x(v) - max_boundary;
        double act_x_max = GA.x(v) + max_boundary;
        double act_y_min = GA.y(v) - max_boundary;
        double act_y_max = GA.y(v) + max_boundary;

        if (act_x_min < x_min) x_min = act_x_min;
        if (act_x_max > x_max) x_max = act_x_max;
        if (act_y_min < y_min) y_min = act_y_min;
        if (act_y_max > y_max) y_max = act_y_max;
    }

    x_min -= componentSeparation / 2;
    x_max += componentSeparation / 2;
    y_min -= componentSeparation / 2;
    y_max += componentSeparation / 2;

    r.set_rectangle(x_max - x_min, y_max - y_min, x_min, y_min, componentIndex);
    return r;
}

static double calculateArea(double width, double height, int comp_nr, double aspectRatio) {
    double scaling = 1.0;
    if (comp_nr == 1) {
        double ratio = width / height;
        if (ratio < aspectRatio) {
            scaling = aspectRatio / ratio;
        } else {
            scaling = ratio / aspectRatio;
        }
    }
    return width * height * scaling;
}

static List<fmmm::Rectangle> rotateComponentsAndCalculateBoundingRectangles(
        GraphAttributes& GA,
        const Array<List<ogdf::node>>& nodesInCC,
        double componentSeparation,
        double aspectRatio,
        int stepsForRotatingComponents = 50) {
    int numCCs = nodesInCC.size();
    const Graph& G = GA.constGraph();
    List<fmmm::Rectangle> R;

    for (int i = 0; i < numCCs; i++) {
        fmmm::Rectangle r_best;
        NodeArray<DPoint> best_coords(G), old_coords(G);

        r_best = calculateBoundingRectangle(GA, nodesInCC[i], componentSeparation, i);
        double best_area = calculateArea(r_best.get_width(), r_best.get_height(),
                                        numCCs, aspectRatio);

        for (ogdf::node v : nodesInCC[i])
            old_coords[v] = best_coords[v] = GA.point(v);

        // Rotate the components
        for (int j = 1; j <= stepsForRotatingComponents; j++) {
            double angle = Math::pi_2 * (double(j) / double(stepsForRotatingComponents + 1));
            double sin_j = sin(angle);
            double cos_j = cos(angle);

            for (ogdf::node v : nodesInCC[i]) {
                DPoint new_pos;
                new_pos.m_x = cos_j * old_coords[v].m_x - sin_j * old_coords[v].m_y;
                new_pos.m_y = sin_j * old_coords[v].m_x + cos_j * old_coords[v].m_y;
                GA.x(v) = new_pos.m_x;
                GA.y(v) = new_pos.m_y;
            }

            fmmm::Rectangle r_act = calculateBoundingRectangle(GA, nodesInCC[i],
                                                               componentSeparation, i);
            double act_area = calculateArea(r_act.get_width(), r_act.get_height(),
                                           numCCs, aspectRatio);

            double act_area_PI_half_rotated;
            if (numCCs == 1)
                act_area_PI_half_rotated = calculateArea(r_act.get_height(),
                                                        r_act.get_width(),
                                                        numCCs, aspectRatio);

            if (act_area < best_area) {
                r_best = r_act;
                best_area = act_area;
                for (ogdf::node v : nodesInCC[i])
                    best_coords[v] = GA.point(v);
            } else if ((numCCs == 1) && (act_area_PI_half_rotated < best_area)) {
                r_best = r_act;
                best_area = act_area_PI_half_rotated;
                for (ogdf::node v : nodesInCC[i])
                    best_coords[v] = GA.point(v);
            }
        }

        // Tip rectangle if needed
        double ratio = r_best.get_width() / r_best.get_height();
        if ((aspectRatio < 1 && ratio > 1) || (aspectRatio >= 1 && ratio < 1)) {
            for (ogdf::node v : nodesInCC[i]) {
                DPoint new_pos;
                new_pos.m_x = best_coords[v].m_y * (-1);
                new_pos.m_y = best_coords[v].m_x;
                best_coords[v] = new_pos;
            }

            DPoint new_dlc;
            new_dlc.m_x = r_best.get_old_dlc_position().m_y * (-1) - r_best.get_height();
            new_dlc.m_y = r_best.get_old_dlc_position().m_x;

            double new_width = r_best.get_height();
            double new_height = r_best.get_width();
            r_best.set_width(new_width);
            r_best.set_height(new_height);
            r_best.set_old_dlc_position(new_dlc);
        }

        for (ogdf::node v : nodesInCC[i]) {
            GA.x(v) = best_coords[v].m_x;
            GA.y(v) = best_coords[v].m_y;
        }

        R.pushBack(r_best);
    }

    return R;
}

static void reassembleDrawings(GraphAttributes& GA,
                              double componentSeparation,
                              double aspectRatio,
                              const Array<List<ogdf::node>>& nodesInCC,
                              bool rotateComponents) {
    // Without rotation the components are still packed: a cut can arrive in
    // several (KIR does), and stacking them is what keeps them apart.
    List<fmmm::Rectangle> R;
    if (rotateComponents) {
        R = rotateComponentsAndCalculateBoundingRectangles(GA, nodesInCC,
                                                           componentSeparation, aspectRatio);
    } else {
        for (int i = 0; i < nodesInCC.size(); i++) {
            R.pushBack(calculateBoundingRectangle(GA, nodesInCC[i], componentSeparation, i));
        }
    }

    double aspect_ratio_area, bounding_rectangles_area;
    fmmm::MAARPacking().pack_rectangles_using_Best_Fit_strategy(
        R, aspectRatio,
        ogdf::FMMMOptions::PreSort::DecreasingHeight,
        rotateComponents ? ogdf::FMMMOptions::TipOver::NoGrowingRow
                         : ogdf::FMMMOptions::TipOver::None,
        aspect_ratio_area, bounding_rectangles_area);

    for (const auto& r : R) {
        int i = r.get_component_index();
        if (r.is_tipped_over()) {
            for (auto v : nodesInCC[i]) {
                DPoint tipped_pos(-GA.y(v), GA.x(v));
                GA.x(v) = tipped_pos.m_x;
                GA.y(v) = tipped_pos.m_y;
            }
        }

        for (auto v : nodesInCC[i]) {
            DPoint newpos = GA.point(v);
            newpos += r.get_new_dlc_position();
            newpos -= r.get_old_dlc_position();
            GA.x(v) = newpos.m_x;
            GA.y(v) = newpos.m_y;
        }
    }
}

namespace layout {

GraphLayout layoutGraph(const AssemblyGraph& graph,
                       int graphLayoutQuality,
                       bool useLinearLayout,
                       double componentSeparation,
                       double aspectRatio,
                       const LayoutSettings* settings) {
    Graph G;
    EdgeArray<double> edgeLengths(G);
    GraphAttributes GA(G,
                      GraphAttributes::nodeGraphics | GraphAttributes::edgeGraphics);
    OGDFGraphLayout ogdfLayout;

    buildGraph(G, GA, edgeLengths, ogdfLayout, graph, settings, useLinearLayout);

    // Split into connected components
    NodeArray<int> componentNumber(G);
    int numberOfComponents = connectedComponents(G, componentNumber);

    if (numberOfComponents == 0)
        return GraphLayout(graph);

    Array<List<ogdf::node>> nodesInCC(numberOfComponents);
    for (auto v : G.nodes)
        nodesInCC[componentNumber[v]].pushBack(v);

    bool anySeed = false;
    for (const auto& pair : graph.nodes) {
        if (pair.second->isDrawn() && pair.second->hasSeed()) {
            anySeed = true;
            break;
        }
    }
    bool keepPositions = useLinearLayout || anySeed;

    // Layout each component
    for (int i = 0; i < numberOfComponents; i++) {
        FMMGraphLayout layouter(graphLayoutQuality, keepPositions,
                               componentSeparation, aspectRatio,
                               settings->randomSeed, settings->rotateComponents);

        GraphCopy GC;
        EdgeArray<double> cedgeLengths(GC);
        EdgeArray<ogdf::edge> auxCopy(G);

        GC.createEmpty(G);
        GC.initByNodes(nodesInCC[i], auxCopy);
        GraphAttributes cGA(GC, GA.attributes());

        for (ogdf::node v : GC.nodes) {
            cGA.x(v) = GA.x(GC.original(v));
            cGA.y(v) = GA.y(GC.original(v));
            cGA.width(v) = GA.width(GC.original(v));
            cGA.height(v) = GA.height(GC.original(v));
        }

        for (ogdf::edge e : GC.edges)
            cedgeLengths(e) = edgeLengths(GC.original(e));

        layouter.run(cGA, cedgeLengths);

        for (ogdf::node v : GC.nodes) {
            ogdf::node w = GC.original(v);
            if (w != nullptr) {
                GA.x(w) = cGA.x(v);
                GA.y(w) = cGA.y(v);
            }
        }
    }

    reassembleDrawings(GA, componentSeparation, aspectRatio, nodesInCC,
                       settings->rotateComponents);

    // Convert to GraphLayout
    GraphLayout result(graph);
    for (const auto& entry : ogdfLayout) {
        for (ogdf::node node : entry.second) {
            result.add(entry.first, Point(GA.x(node), GA.y(node)));
        }
    }

    // Add reverse complement nodes in double mode
    for (const auto& entry : ogdfLayout) {
        auto* rcNode = entry.first->getReverseComplement();
        if (!rcNode || !rcNode->isDrawn())
            continue;

        auto& segments = entry.second;
        for (auto it = segments.rbegin(); it != segments.rend(); ++it) {
            result.add(rcNode, Point(GA.x(*it), GA.y(*it)));
        }
    }

    return result;
}

void apply(AssemblyGraph& graph, const GraphLayout& layout) {
    graph.resetNodes();
    for (const auto& entry : layout)
        entry.first->setAsDrawn();

    for (auto* edge : graph.edges)
        edge->drawn = (edge->getStartingNode()->isDrawn() &&
                      edge->getEndingNode()->isDrawn());
}

} // namespace layout
