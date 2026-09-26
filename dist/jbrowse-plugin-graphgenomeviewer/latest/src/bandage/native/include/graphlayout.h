// Copyright 2022 Anton Korobeynikov
// Copyright 2024 Bandage Layout JS Port

// This file is part of Bandage

// Bandage is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

#pragma once

#include "types.h"
#include "graph.h"
#include "settings.h"
#include <unordered_map>
#include <vector>

// Forward declaration
struct LayoutSettings;

// Graph layout storage
class GraphLayout {
public:
    explicit GraphLayout(const AssemblyGraph& graph) : m_graph(graph) {}

    const AssemblyGraph& graph() const { return m_graph; }

    bool contains(const DeBruijnNode* node) const {
        auto it = m_data.find(const_cast<DeBruijnNode*>(node));
        return it != m_data.end();
    }

    void add(DeBruijnNode* node, Point point) {
        m_data[node].push_back(point);
    }

    size_t size() const { return m_data.size(); }

    const std::vector<Point>& segments(const DeBruijnNode* node) const {
        auto it = m_data.find(const_cast<DeBruijnNode*>(node));
        if (it == m_data.end()) {
            static const std::vector<Point> empty;
            return empty;
        }
        return it->second;
    }

    std::vector<Point>& segments(DeBruijnNode* node) {
        return m_data[node];
    }

    auto begin() { return m_data.begin(); }
    auto begin() const { return m_data.begin(); }
    auto end() { return m_data.end(); }
    auto end() const { return m_data.end(); }

private:
    const AssemblyGraph& m_graph;
    std::unordered_map<DeBruijnNode*, std::vector<Point>> m_data;
};

namespace layout {
    // Main layout computation function
    GraphLayout layoutGraph(const AssemblyGraph& graph,
                           int graphLayoutQuality,
                           bool useLinearLayout,
                           double componentSeparation,
                           double aspectRatio,
                           const LayoutSettings* settings);

    // Helper to apply layout (sets nodes as drawn)
    void apply(AssemblyGraph& graph, const GraphLayout& layout);
}
