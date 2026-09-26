// Emscripten bindings for Bandage Layout

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "../include/graphlayout.h"
#include "../include/settings.h"
#include <cmath>
#include <memory>

using namespace emscripten;

// Helper to create graph from JavaScript object
std::unique_ptr<AssemblyGraph> createGraphFromJS(const val& jsGraph) {
    auto graph = std::make_unique<AssemblyGraph>();

    // Parse nodes
    val jsNodes = jsGraph["nodes"];
    unsigned length = jsNodes["length"].as<unsigned>();

    for (unsigned i = 0; i < length; ++i) {
        val node = jsNodes[i];
        std::string id = node["id"].as<std::string>();
        unsigned nodeLength = node["length"].as<unsigned>();
        float depth = node["depth"].as<float>();

        auto* n = graph->addNode(id, nodeLength, depth);
        n->setAsDrawn(); // Assume all input nodes should be drawn

        // Optional seed. A missing property reads as undefined, so isNumber()
        // is the whole presence check; the finite test keeps a NaN from
        // reaching FMMM, which has no way to report one.
        val x = node["x"];
        val y = node["y"];
        if (x.isNumber() && y.isNumber()) {
            double seedX = x.as<double>();
            double seedY = y.as<double>();
            if (std::isfinite(seedX) && std::isfinite(seedY)) {
                n->setSeed(seedX, seedY);
            }
        }
    }

    // Set up reverse complements (assuming +/- naming convention)
    for (auto& pair : graph->nodes) {
        std::string name = pair.first;
        if (name.empty()) continue;

        char sign = name.back();
        std::string baseName = name.substr(0, name.length() - 1);

        if (sign == '+') {
            std::string rcName = baseName + "-";
            auto it = graph->nodes.find(rcName);
            if (it != graph->nodes.end()) {
                pair.second->setReverseComplement(it->second);
                it->second->setReverseComplement(pair.second);
            }
        }
    }

    // Parse edges
    val jsEdges = jsGraph["edges"];
    length = jsEdges["length"].as<unsigned>();

    for (unsigned i = 0; i < length; ++i) {
        val edge = jsEdges[i];
        std::string from = edge["from"].as<std::string>();
        std::string to = edge["to"].as<std::string>();
        int overlap = edge.hasOwnProperty("overlap") ?
                     edge["overlap"].as<int>() : 0;

        auto* e = graph->addEdge(from, to, overlap, UNKNOWN_OVERLAP);
        if (e) e->setAsDrawn();
    }

    return graph;
}

// Helper to convert layout to JavaScript object
val layoutToJS(const GraphLayout& layout) {
    val result = val::object();
    val nodePositions = val::object();

    for (const auto& entry : layout) {
        std::string nodeName = entry.first->getName();
        const auto& segments = entry.second;

        val jsSegments = val::array();
        for (size_t i = 0; i < segments.size(); ++i) {
            val point = val::object();
            point.set("x", segments[i].x);
            point.set("y", segments[i].y);
            jsSegments.set(i, point);
        }

        nodePositions.set(nodeName, jsSegments);
    }

    result.set("nodePositions", nodePositions);
    return result;
}

// Main layout computation function exposed to JavaScript
val computeLayout(val jsGraph, val jsOptions) {
    // Parse options
    int quality = jsOptions.hasOwnProperty("quality") ?
                 jsOptions["quality"].as<int>() : 1;
    bool linearLayout = jsOptions.hasOwnProperty("linearLayout") ?
                       jsOptions["linearLayout"].as<bool>() : false;
    double componentSeparation = jsOptions.hasOwnProperty("componentSeparation") ?
                                jsOptions["componentSeparation"].as<double>() : 15.0;
    double aspectRatio = jsOptions.hasOwnProperty("aspectRatio") ?
                        jsOptions["aspectRatio"].as<double>() : 1.333333;

    // Create settings
    LayoutSettings settings;
    settings.graphLayoutQuality = quality;
    settings.useLinearLayout = linearLayout;
    settings.componentSeparation = componentSeparation;
    settings.aspectRatio = aspectRatio;

    if (jsOptions.hasOwnProperty("nodeLengthPerMegabase")) {
        settings.autoNodeLengthPerMegabase = jsOptions["nodeLengthPerMegabase"].as<double>();
        settings.manualNodeLengthPerMegabase = jsOptions["nodeLengthPerMegabase"].as<double>();
    }
    if (jsOptions.hasOwnProperty("minimumNodeLength")) {
        settings.minimumNodeLength = jsOptions["minimumNodeLength"].as<double>();
    }
    if (jsOptions.hasOwnProperty("nodeSegmentLength")) {
        settings.nodeSegmentLength = jsOptions["nodeSegmentLength"].as<double>();
    }
    if (jsOptions.hasOwnProperty("edgeLength")) {
        settings.edgeLength = jsOptions["edgeLength"].as<double>();
    }
    if (jsOptions.hasOwnProperty("seed")) {
        settings.randomSeed = jsOptions["seed"].as<int>();
    }
    if (jsOptions.hasOwnProperty("rotateComponents")) {
        settings.rotateComponents = jsOptions["rotateComponents"].as<bool>();
    }

    // Owning, and declared BEFORE the layout that borrows it: GraphLayout holds
    // a `const AssemblyGraph&`, so the graph has to outlive it, and reverse
    // destruction order is what guarantees that.
    //
    // This was a raw `new` with a `delete` after the layout, which leaked the
    // whole graph on any throw between the two — and there was one. `toInt`
    // aborted on a non-numeric segment name (types.h), so every linear-layout
    // call on a minigraph rGFA leaked its graph, and about twenty of them
    // exhausted the heap and left the cached module unable to lay anything out
    // at all. The name parse is fixed; this is what stops the next throw from
    // costing a session.
    auto graph = createGraphFromJS(jsGraph);

    GraphLayout layoutResult = layout::layoutGraph(*graph, quality, linearLayout,
                                                   componentSeparation, aspectRatio,
                                                   &settings);

    return layoutToJS(layoutResult);
}

EMSCRIPTEN_BINDINGS(bandage_layout) {
    function("computeLayout", &computeLayout);
}
