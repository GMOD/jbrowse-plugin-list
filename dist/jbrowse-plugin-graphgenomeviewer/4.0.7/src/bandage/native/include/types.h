// Copyright 2022 Anton Korobeynikov
// Copyright 2024 Bandage Layout JS Port

// This file is part of Bandage

// Bandage is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

#pragma once

#include <charconv>
#include <optional>
#include <string>
#include <string_view>

struct Point {
    double x;
    double y;

    Point() : x(0.0), y(0.0) {}
    Point(double x_, double y_) : x(x_), y(y_) {}

    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// The whole string as an int, or nothing.
//
// **Nothing here may throw, and this is why.** Emscripten builds with
// exception catching off by default (-sDISABLE_EXCEPTION_CATCHING), so a
// `throw` does not unwind to a handler — it calls abort(). This used to be a
// `std::stoi` wrapped in `catch (...)`, which reads as safe and is not: stoi
// throws std::invalid_argument on any non-numeric string, the catch was
// compiled away, and the whole module aborted.
//
// The one caller asks it whether a SEGMENT NAME is numeric, so the strings that
// hit the failing path are the ordinary ones: minigraph names its segments
// `s1`, `s2`, so every rGFA — the format this plugin is built around — took the
// throw. That made the linear layout an abort on those graphs, and because each
// aborted call leaked the graph it had built (bindings.cpp), about twenty of
// them exhausted the worker's heap and left every LATER layout failing with
// "memory access out of bounds" for as long as the module stayed cached.
//
// from_chars also declines a value too large for an int, where stoi threw
// std::out_of_range and so aborted on a segment named with a 20-digit number.
inline std::optional<int> parseWholeInt(std::string_view str) {
    int value = 0;
    const char* first = str.data();
    const char* last = first + str.size();
    auto [ptr, ec] = std::from_chars(first, last, value);
    return ec == std::errc() && ptr == last ? std::optional<int>(value)
                                            : std::nullopt;
}
