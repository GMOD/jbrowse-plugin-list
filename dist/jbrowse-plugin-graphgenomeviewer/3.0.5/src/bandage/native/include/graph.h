// Copyright 2017 Ryan Wick
// Copyright 2024 Bandage Layout JS Port

// This file is part of Bandage

// Bandage is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

#pragma once

#include "types.h"
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <memory>

// Forward declarations
class DeBruijnNode;
class DeBruijnEdge;

// Edge overlap types
enum EdgeOverlapType {
    UNKNOWN_OVERLAP,
    EXACT_OVERLAP,
    AUTO_DETERMINED_EXACT_OVERLAP,
    JUMP,
    EXTRA_LINK
};

// Simplified DeBruijnEdge for layout computation
class DeBruijnEdge {
public:
    DeBruijnNode* startingNode;
    DeBruijnNode* endingNode;
    int overlap;
    EdgeOverlapType overlapType;
    bool drawn;

    DeBruijnEdge(DeBruijnNode* start, DeBruijnNode* end)
        : startingNode(start), endingNode(end), overlap(0),
          overlapType(UNKNOWN_OVERLAP), drawn(false) {}

    DeBruijnNode* getStartingNode() const { return startingNode; }
    DeBruijnNode* getEndingNode() const { return endingNode; }
    int getOverlap() const { return overlap; }
    EdgeOverlapType getOverlapType() const { return overlapType; }
    bool isDrawn() const { return drawn; }
    void setAsDrawn() { drawn = true; }
    void setAsNotDrawn() { drawn = false; }
};

// Simplified DeBruijnNode for layout computation
class DeBruijnNode {
public:
    std::string name;
    unsigned length;
    float depth;
    bool drawn;
    DeBruijnNode* reverseComplement;
    std::vector<DeBruijnEdge*> edges;
    // Where FMMM starts this node's chain, when the caller has an opinion:
    // reference-anchored graphs seed the backbone along x so the layout keeps
    // its coarse shape instead of curling (docs/layout-experiments.md).
    bool seeded;
    double seedX;
    double seedY;

    DeBruijnNode(const std::string& name_, unsigned length_, float depth_)
        : name(name_), length(length_), depth(depth_), drawn(false),
          reverseComplement(nullptr), seeded(false), seedX(0.0), seedY(0.0) {}

    std::string getName() const { return name; }
    std::string getNameWithoutSign() const {
        if (name.length() > 0)
            return name.substr(0, name.length() - 1);
        return name;
    }

    unsigned getLength() const { return length; }
    float getDepth() const { return depth; }
    bool isDrawn() const { return drawn; }
    void setAsDrawn() { drawn = true; }
    void setAsNotDrawn() { drawn = false; }
    DeBruijnNode* getReverseComplement() const { return reverseComplement; }
    void setReverseComplement(DeBruijnNode* rc) { reverseComplement = rc; }
    bool hasSeed() const { return seeded; }
    void setSeed(double x, double y) {
        seeded = true;
        seedX = x;
        seedY = y;
    }

    std::vector<DeBruijnNode*> getUpstreamNodes() const {
        std::vector<DeBruijnNode*> result;
        for (auto* edge : edges) {
            if (edge->getEndingNode() == this) {
                result.push_back(edge->getStartingNode());
            }
        }
        return result;
    }

    bool isPositiveNode() const {
        if (name.empty()) return true;
        return name.back() == '+';
    }
};

// Simplified AssemblyGraph for layout computation
class AssemblyGraph {
public:
    std::unordered_map<std::string, DeBruijnNode*> nodes;
    std::vector<DeBruijnEdge*> edges;

    AssemblyGraph() = default;

    // Owns every node and edge by raw pointer, so a copy would delete each of
    // them twice. Nothing copies one today — it is built once per call and
    // passed by reference — and this is what keeps that true.
    AssemblyGraph(const AssemblyGraph&) = delete;
    AssemblyGraph& operator=(const AssemblyGraph&) = delete;

    ~AssemblyGraph() {
        for (auto& pair : nodes) {
            delete pair.second;
        }
        for (auto* edge : edges) {
            delete edge;
        }
    }

    DeBruijnNode* addNode(const std::string& name, unsigned length, float depth) {
        auto* node = new DeBruijnNode(name, length, depth);
        nodes[name] = node;
        return node;
    }

    DeBruijnEdge* addEdge(const std::string& fromName, const std::string& toName,
                          int overlap = 0, EdgeOverlapType type = UNKNOWN_OVERLAP) {
        auto fromIt = nodes.find(fromName);
        auto toIt = nodes.find(toName);

        if (fromIt == nodes.end() || toIt == nodes.end()) {
            return nullptr;
        }

        auto* edge = new DeBruijnEdge(fromIt->second, toIt->second);
        edge->overlap = overlap;
        edge->overlapType = type;
        edges.push_back(edge);

        fromIt->second->edges.push_back(edge);
        toIt->second->edges.push_back(edge);

        return edge;
    }

    void resetNodes() {
        for (auto& pair : nodes) {
            pair.second->setAsNotDrawn();
        }
    }

    void resetEdges() {
        for (auto* edge : edges) {
            edge->setAsNotDrawn();
        }
    }

    std::vector<DeBruijnNode*> getDrawnNodes() const {
        std::vector<DeBruijnNode*> result;
        for (const auto& pair : nodes) {
            if (pair.second->isDrawn()) {
                result.push_back(pair.second);
            }
        }
        return result;
    }

    // For iteration (C++11 range-based for loops)
    auto begin() { return nodes.begin(); }
    auto end() { return nodes.end(); }
    auto begin() const { return nodes.begin(); }
    auto end() const { return nodes.end(); }
};
