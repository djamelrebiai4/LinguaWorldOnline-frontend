#!/usr/bin/env python3
"""Generate the lightweight, procedural LinguaWorld town and its collision mesh."""

import json
import math
import random
import struct
import subprocess
import zlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GROUND_DIR = ROOT / "Grounds"
RNG = random.Random(20261114)

MATERIALS = {
    "asphalt": {"color": [1, 1, 1], "roughness": 0.96, "texture": "asphalt", "uv": 0.14},
    "sidewalk": {"color": [1, 1, 1], "roughness": 0.9, "texture": "stone", "uv": 0.42},
    "curb": {"color": [0.69, 0.67, 0.61], "roughness": 0.9, "texture": "stone", "uv": 0.42},
    "road_marking": {"color": [0.91, 0.89, 0.79], "roughness": 0.76},
    "grass": {"color": [0.72, 0.84, 0.66], "roughness": 1, "texture": "grass", "uv": 0.18},
    "path": {"color": [0.68, 0.66, 0.59], "roughness": 0.9, "texture": "stone", "uv": 0.35},
    "wall_cream": {"color": [0.91, 0.84, 0.72], "roughness": 0.88, "texture": "stucco", "uv": 0.28},
    "wall_sand": {"color": [0.86, 0.72, 0.56], "roughness": 0.88, "texture": "stucco", "uv": 0.28},
    "wall_sage": {"color": [0.7, 0.8, 0.68], "roughness": 0.88, "texture": "stucco", "uv": 0.28},
    "wall_blue": {"color": [0.63, 0.76, 0.8], "roughness": 0.88, "texture": "stucco", "uv": 0.28},
    "brick": {"color": [1, 1, 1], "roughness": 0.94, "texture": "brick", "uv": 0.22},
    "roof_tile": {"color": [0.8, 0.78, 0.73], "roughness": 0.94, "texture": "roof", "uv": 0.7},
    "roof_slate": {"color": [0.35, 0.41, 0.4], "roughness": 0.88, "texture": "roof", "uv": 0.7},
    "glass": {"color": [0.72, 0.88, 0.91], "roughness": 0.22, "metallic": 0.12, "texture": "glass", "uv": 0.4},
    "trim": {"color": [0.94, 0.9, 0.82], "roughness": 0.74},
    "wood": {"color": [0.73, 0.55, 0.37], "roughness": 0.84, "texture": "wood", "uv": 0.38},
    "dark_wood": {"color": [0.39, 0.29, 0.22], "roughness": 0.9, "texture": "wood", "uv": 0.38},
    "metal": {"color": [0.19, 0.25, 0.25], "roughness": 0.45, "metallic": 0.58},
    "foliage": {"color": [0.49, 0.68, 0.43], "roughness": 0.96, "texture": "grass", "uv": 0.3},
    "foliage_dark": {"color": [0.34, 0.53, 0.35], "roughness": 0.96, "texture": "grass", "uv": 0.3},
    "bark": {"color": [0.37, 0.26, 0.19], "roughness": 0.96, "texture": "wood", "uv": 0.4},
    "sign_cafe": {"color": [0.49, 0.22, 0.14], "roughness": 0.7},
    "sign_market": {"color": [0.2, 0.36, 0.32], "roughness": 0.7},
    "sign_school": {"color": [0.24, 0.36, 0.48], "roughness": 0.7},
    "sign_home": {"color": [0.36, 0.34, 0.29], "roughness": 0.7},
    "letter": {"color": [0.98, 0.92, 0.78], "roughness": 0.65, "emissive": [0.05, 0.035, 0.015]},
    "flower_red": {"color": [0.77, 0.31, 0.27], "roughness": 0.8},
    "flower_yellow": {"color": [0.91, 0.68, 0.28], "roughness": 0.8},
    "water": {"color": [0.36, 0.69, 0.74], "roughness": 0.2, "metallic": 0.1},
    "car_blue": {"color": [0.2, 0.39, 0.48], "roughness": 0.34, "metallic": 0.24},
    "car_red": {"color": [0.62, 0.24, 0.18], "roughness": 0.34, "metallic": 0.2},
    "car_cream": {"color": [0.82, 0.75, 0.62], "roughness": 0.38, "metallic": 0.12},
    "rubber": {"color": [0.095, 0.11, 0.11], "roughness": 0.97},
    "lamp_glow": {
        "color": [1, 0.78, 0.47],
        "roughness": 0.3,
        "emissive": [0.65, 0.28, 0.08]
    },
    "collision": {"color": [0.8, 0.8, 0.8], "roughness": 1}
}

INTERACTION_KEYS = (
    "street", "building", "door", "tree", "street_light", "car", "bench",
    "traffic_light", "park", "school", "supermarket", "coffee_shop", "house"
)


class MeshBuilder:
    def __init__(self):
        self.vertices = {}

    @staticmethod
    def _normal(a, b, c):
        ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
        ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
        normal = (
            ab[1] * ac[2] - ab[2] * ac[1],
            ab[2] * ac[0] - ab[0] * ac[2],
            ab[0] * ac[1] - ab[1] * ac[0]
        )
        length = math.sqrt(sum(value * value for value in normal)) or 1
        return tuple(value / length for value in normal)

    def triangle(self, material, a, b, c, uvs):
        normal = self._normal(a, b, c)
        bucket = self.vertices.setdefault(material, [])
        for point, uv in zip((a, b, c), uvs):
            bucket.append((*point, *normal, *uv))

    def quad(self, material, points, uv_width=1, uv_height=1):
        scale = MATERIALS.get(material, {}).get("uv", 0.25)
        uvs = [
            (0, 0),
            (uv_width * scale, 0),
            (uv_width * scale, uv_height * scale),
            (0, uv_height * scale)
        ]
        self.triangle(material, points[0], points[1], points[2], [uvs[0], uvs[1], uvs[2]])
        self.triangle(material, points[0], points[2], points[3], [uvs[0], uvs[2], uvs[3]])

    def box(self, material, center, size):
        x, y, z = center
        sx, sy, sz = size
        x0, x1 = x - sx / 2, x + sx / 2
        y0, y1 = y - sy / 2, y + sy / 2
        z0, z1 = z - sz / 2, z + sz / 2
        faces = [
            ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], sx, sy),
            ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], sx, sy),
            ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], sz, sy),
            ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], sz, sy),
            ([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], sx, sz),
            ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], sx, sz)
        ]
        for points, width, height in faces:
            self.quad(material, points, width, height)

    def triangle_face(self, material, a, b, c):
        self.triangle(material, a, b, c, [(0, 0), (1, 0), (0.5, 1)])

    def rectangle(self, material, x, y, z, face, width, height, offset=0):
        if face in ("north", "south"):
            direction = 1 if face == "north" else -1
            plane = z + direction * offset
            points = [
                (x - width / 2, y - height / 2, plane),
                (x + width / 2, y - height / 2, plane),
                (x + width / 2, y + height / 2, plane),
                (x - width / 2, y + height / 2, plane)
            ]
            if direction < 0:
                points.reverse()
        else:
            direction = 1 if face == "east" else -1
            plane = x + direction * offset
            points = [
                (plane, y - height / 2, z - width / 2),
                (plane, y - height / 2, z + width / 2),
                (plane, y + height / 2, z + width / 2),
                (plane, y + height / 2, z - width / 2)
            ]
            if direction > 0:
                points.reverse()
        self.quad(material, points, width, height)

    def cylinder(self, material, center, radius_bottom, radius_top, height, sides=10):
        x, y, z = center
        lower = []
        upper = []
        for index in range(sides):
            angle = 2 * math.pi * index / sides
            lower.append((x + math.cos(angle) * radius_bottom, y - height / 2,
                          z + math.sin(angle) * radius_bottom))
            upper.append((x + math.cos(angle) * radius_top, y + height / 2,
                          z + math.sin(angle) * radius_top))
        for index in range(sides):
            nxt = (index + 1) % sides
            self.quad(material, [lower[index], lower[nxt], upper[nxt], upper[index]], 1, height)
            self.triangle_face(material, (x, y - height / 2, z), lower[nxt], lower[index])
            self.triangle_face(material, (x, y + height / 2, z), upper[index], upper[nxt])

    def sphere(self, material, center, radius, scale=(1, 1, 1), rings=5, segments=8):
        x, y, z = center
        layers = []
        for ring in range(rings + 1):
            phi = math.pi * ring / rings
            row = []
            for segment in range(segments):
                theta = 2 * math.pi * segment / segments
                row.append((
                    x + radius * scale[0] * math.sin(phi) * math.cos(theta),
                    y + radius * scale[1] * math.cos(phi),
                    z + radius * scale[2] * math.sin(phi) * math.sin(theta)
                ))
            layers.append(row)
        for ring in range(rings):
            for segment in range(segments):
                nxt = (segment + 1) % segments
                self.quad(material, [
                    layers[ring][segment],
                    layers[ring + 1][segment],
                    layers[ring + 1][nxt],
                    layers[ring][nxt]
                ])


class City:
    def __init__(self):
        self.visual = MeshBuilder()
        self.collision = MeshBuilder()
        self.buildings = []

    def interaction_box(self, key, center, size):
        if key not in INTERACTION_KEYS:
            raise ValueError(f"Unknown city interaction vocabulary key: {key}")
        self.visual.box(f"interaction_{key}", center, size)

    def box(self, material, center, size, collision=False, visible=True):
        if visible:
            self.visual.box(material, center, size)
        if collision:
            self.collision.box("collision", center, size)

    def quad(self, material, points, width, height):
        self.visual.quad(material, points, width, height)

    def rectangle(self, material, x, y, z, face, width, height, offset=0):
        self.visual.rectangle(material, x, y, z, face, width, height, offset)

    def street(self, start, end, width, sidewalk=2.8):
        x1, z1 = start
        x2, z2 = end
        horizontal = abs(z2 - z1) < 0.01
        length = abs(x2 - x1) if horizontal else abs(z2 - z1)
        midpoint = ((x1 + x2) / 2, (z1 + z2) / 2)
        self.box("asphalt", (midpoint[0], 0.035, midpoint[1]),
                 (length, 0.08, width) if horizontal else (width, 0.08, length))
        self.interaction_box(
            "street",
            (midpoint[0], 0.12, midpoint[1]),
            (length, 0.08, width + sidewalk * 2) if horizontal
            else (width + sidewalk * 2, 0.08, length)
        )
        self.collision.box("collision", (midpoint[0], -0.22, midpoint[1]),
                           (length, 0.45, width + sidewalk * 2 + 0.7)
                           if horizontal else (width + sidewalk * 2 + 0.7, 0.45, length))
        for side in (-1, 1):
            if horizontal:
                edge_z = midpoint[1] + side * width / 2
                self.box("curb", (midpoint[0], 0.12, edge_z),
                         (length, 0.24, 0.32), collision=True)
                self.box("sidewalk", (midpoint[0], 0.12, edge_z + side * (0.16 + sidewalk / 2)),
                         (length, 0.24, sidewalk), collision=True)
                count = int(length // 5)
                for index in range(1, count):
                    x = min(x1, x2) + index * 5
                    seam_z = edge_z + side * (0.16 + sidewalk / 2)
                    self.visual.quad("curb", [
                        (x - 0.012, 0.245, seam_z - sidewalk / 2),
                        (x + 0.012, 0.245, seam_z - sidewalk / 2),
                        (x + 0.012, 0.245, seam_z + sidewalk / 2),
                        (x - 0.012, 0.245, seam_z + sidewalk / 2)
                    ])
            else:
                edge_x = midpoint[0] + side * width / 2
                self.box("curb", (edge_x, 0.12, midpoint[1]),
                         (0.32, 0.24, length), collision=True)
                self.box("sidewalk", (edge_x + side * (0.16 + sidewalk / 2), 0.12, midpoint[1]),
                         (sidewalk, 0.24, length), collision=True)
                count = int(length // 5)
                for index in range(1, count):
                    z = min(z1, z2) + index * 5
                    seam_x = edge_x + side * (0.16 + sidewalk / 2)
                    self.visual.quad("curb", [
                        (seam_x - sidewalk / 2, 0.245, z - 0.012),
                        (seam_x + sidewalk / 2, 0.245, z - 0.012),
                        (seam_x + sidewalk / 2, 0.245, z + 0.012),
                        (seam_x - sidewalk / 2, 0.245, z + 0.012)
                    ])

    def crosswalk(self, x, z, direction="north"):
        for index in range(7):
            if direction == "north":
                self.box("road_marking", (x - 3.6 + index * 1.2, 0.09, z),
                         (0.58, 0.025, 8.5))
            else:
                self.box("road_marking", (x, 0.09, z - 3.6 + index * 1.2),
                         (8.5, 0.025, 0.58))

    def lane_dashes(self, start, end, coordinate, horizontal=True, skips=()):
        low, high = sorted((start, end))
        for value in range(int(low + 8), int(high - 4), 12):
            if any(abs(value - item) < 16 for item in skips):
                continue
            position = (value, 0.085, coordinate) if horizontal else (coordinate, 0.085, value)
            size = (4, 0.025, 0.16) if horizontal else (0.16, 0.025, 4)
            self.box("road_marking", position, size)

    def window(self, x, y, z, face, width=1.12, height=1.48):
        direction = 1 if face in ("north", "east") else -1
        self.rectangle("glass", x, y, z, face, width, height, 0.09)
        if face in ("north", "south"):
            frame = [
                (x, y - height / 2 - 0.055, z, width + 0.16, 0.1),
                (x, y + height / 2 + 0.055, z, width + 0.16, 0.1),
                (x - width / 2 - 0.03, y, z, 0.1, height),
                (x + width / 2 + 0.03, y, z, 0.1, height)
            ]
        else:
            frame = [
                (x, y - height / 2 - 0.055, z, width + 0.16, 0.1),
                (x, y + height / 2 + 0.055, z, width + 0.16, 0.1),
                (x, y, z - width / 2 - 0.03, 0.1, height),
                (x, y, z + width / 2 + 0.03, 0.1, height)
            ]
        for fx, fy, fz, fw, fh in frame:
            self.rectangle("trim", fx, fy, fz, face, fw, fh, 0.12)
        self.rectangle("trim", x, y, z, face, 0.055, height, 0.14)
        self.rectangle("glass", x - width * 0.23, y, z, face, 0.035,
                       height * 0.8, 0.15)
        sill_x, sill_z = x, z
        sill_size = (width + 0.32, 0.12, 0.28)
        if face in ("north", "south"):
            sill_z += direction * 0.16
        else:
            sill_x += direction * 0.16
            sill_size = (0.28, 0.12, width + 0.32)
        self.box("trim", (sill_x, y - height / 2 - 0.14, sill_z), sill_size)

    def door(self, x, z, face, width=1.18, height=2.42):
        direction = 1 if face in ("north", "east") else -1
        self.rectangle("glass", x, height / 2, z, face, width, height, 0.12)
        frames = [
            (x - width / 2 - 0.07, height / 2, z, 0.12, height + 0.16),
            (x + width / 2 + 0.07, height / 2, z, 0.12, height + 0.16),
            (x, height + 0.08, z, width + 0.26, 0.12)
        ]
        if face in ("east", "west"):
            frames = [
                (x, height / 2, z - width / 2 - 0.07, 0.12, height + 0.16),
                (x, height / 2, z + width / 2 + 0.07, 0.12, height + 0.16),
                (x, height + 0.08, z, width + 0.26, 0.12)
            ]
        for fx, fy, fz, fw, fh in frames:
            self.rectangle("trim", fx, fy, fz, face, fw, fh, 0.17)
        handle_x, handle_z = x + width * 0.32, z
        if face in ("north", "south"):
            handle_z += direction * 0.2
        else:
            handle_x += direction * 0.2
        self.box("metal", (handle_x, 1.05, handle_z), (0.06, 0.2, 0.06))
        step_x, step_z = x, z
        if face in ("north", "south"):
            step_z += direction * 1.15
            step_size = (width + 0.9, 0.28, 1.1)
        else:
            step_x += direction * 1.15
            step_size = (1.1, 0.28, width + 0.9)
        self.box("sidewalk", (step_x, 0.14, step_z), step_size)

    def add_label(self, text, x, y, z, scale=0.14):
        font = {
            "A": ["010", "101", "111", "101", "101"],
            "B": ["110", "101", "110", "101", "110"],
            "C": ["011", "100", "100", "100", "011"],
            "E": ["111", "100", "110", "100", "111"],
            "F": ["111", "100", "110", "100", "100"],
            "H": ["101", "101", "111", "101", "101"],
            "K": ["101", "101", "110", "101", "101"],
            "L": ["100", "100", "100", "100", "111"],
            "M": ["101", "111", "111", "101", "101"],
            "O": ["111", "101", "101", "101", "111"],
            "R": ["110", "101", "110", "101", "101"],
            "S": ["011", "100", "010", "001", "110"],
            "T": ["111", "010", "010", "010", "010"],
            "U": ["101", "101", "101", "101", "111"]
        }
        char_width = 3 * scale
        gap = scale
        total = len(text) * (char_width + gap) - gap
        cursor = x - total / 2
        for char in text:
            bitmap = font.get(char, ["111", "101", "101", "101", "111"])
            for row, line in enumerate(bitmap):
                for column, pixel in enumerate(line):
                    if pixel == "1":
                        self.visual.rectangle(
                            "letter",
                            cursor + (column + 0.5) * scale,
                            y + (2 - row) * scale,
                            z,
                            "north",
                            scale * 0.76,
                            scale * 0.76
                        )
            cursor += char_width + gap

    def building(self, x, z, width, depth, floors, wall, roof, style="house",
                 front="north", label="", sign="sign_home"):
        height = floors * 3.05
        self.buildings.append((x, z, width, depth, height, front, style))
        building_key = {
            "SCHULE": "school",
            "MARKT": "supermarket",
            "CAFE": "coffee_shop",
            "HAUS": "house"
        }.get(label, "building")
        self.interaction_box(
            building_key,
            (x, (height + 2.8) / 2, z),
            (width + 0.12, height + 2.8, depth + 0.12)
        )
        self.box(wall, (x, height / 2, z), (width, height, depth))
        self.box("trim", (x, 0.35, z), (width + 0.18, 0.3, depth + 0.18))
        door_width = 1.5
        door_height = 2.45
        wall_thickness = 0.65
        if front in ("north", "south"):
            front_z = z + (depth / 2 if front == "north" else -depth / 2)
            back_z = z - (depth / 2 if front == "north" else -depth / 2)
            self.collision.box("collision", (x, height / 2, back_z),
                               (width, height, wall_thickness))
            for side in (-1, 1):
                self.collision.box("collision", (x + side * (width / 2 - wall_thickness / 2),
                                                 height / 2, z),
                                   (wall_thickness, height, depth))
                self.collision.box("collision", (x + side * (door_width / 2 + (width - door_width) / 4),
                                                 height / 2, front_z),
                                   ((width - door_width) / 2, height, wall_thickness))
            self.collision.box("collision", (x, (height + door_height) / 2, front_z),
                               (door_width, height - door_height, wall_thickness))
            door_z = front_z
            door_x = x
        else:
            front_x = x + (width / 2 if front == "east" else -width / 2)
            back_x = x - (width / 2 if front == "east" else -width / 2)
            self.collision.box("collision", (back_x, height / 2, z),
                               (wall_thickness, height, depth))
            for side in (-1, 1):
                self.collision.box("collision", (x, height / 2, z + side * (depth / 2 - wall_thickness / 2)),
                                   (width, height, wall_thickness))
                self.collision.box("collision", (front_x, height / 2,
                                                 z + side * (door_width / 2 + (depth - door_width) / 4)),
                                   (wall_thickness, height, (depth - door_width) / 2))
            self.collision.box("collision", (front_x, (height + door_height) / 2, z),
                               (wall_thickness, height - door_height, door_width))
            door_z = z
            door_x = front_x

        if front == "north":
            door_center = (door_x, door_height / 2, door_z + 0.13)
            door_size = (door_width, door_height, 0.12)
        elif front == "south":
            door_center = (door_x, door_height / 2, door_z - 0.13)
            door_size = (door_width, door_height, 0.12)
        elif front == "east":
            door_center = (door_x + 0.13, door_height / 2, door_z)
            door_size = (0.12, door_height, door_width)
        else:
            door_center = (door_x - 0.13, door_height / 2, door_z)
            door_size = (0.12, door_height, door_width)
        self.interaction_box("door", door_center, door_size)

        if style in ("house", "shop", "school", "market"):
            floors_on_side = floors
            for floor in range(floors_on_side):
                window_y = 1.95 + floor * 3.05
                for face in ("north", "south"):
                    face_z = z + (depth / 2 if face == "north" else -depth / 2)
                    count = max(2, int(width // (3.3 if style != "school" else 4.1)))
                    for column in range(count):
                        window_x = x - width / 2 + (column + 0.5) * width / count
                        is_entry_column = face == front and floor == 0 and abs(window_x - x) < width / count * 0.65
                        if is_entry_column and style in ("shop", "school", "house", "market"):
                            continue
                        window_width = min(1.7, width / count * 0.48)
                        window_height = 1.75 if floor == 0 and style == "school" else 1.48
                        self.window(window_x, window_y, face_z, face, window_width, window_height)
                        if style == "house" and face == front and floor == 1 and column == count // 2:
                            balcony_z = face_z + (0.55 if face == "north" else -0.55)
                            self.box("sidewalk", (window_x, window_y - 1.1, balcony_z),
                                     (window_width + 0.75, 0.16, 0.9))
                            rail_z = balcony_z + (0.4 if face == "north" else -0.4)
                            self.box("metal", (window_x, window_y - 0.58, rail_z),
                                     (window_width + 0.62, 0.08, 0.08))
                            for side in (-1, 1):
                                self.box("metal", (window_x + side * (window_width + 0.55) / 2,
                                                   window_y - 0.82, rail_z),
                                         (0.07, 0.48, 0.08))
                for face in ("east", "west"):
                    face_x = x + (width / 2 if face == "east" else -width / 2)
                    count = max(2, int(depth // 4))
                    for column in range(count):
                        window_z = z - depth / 2 + (column + 0.5) * depth / count
                        self.window(face_x, window_y, window_z, face, 1.05, 1.42)

        self.door(door_x, door_z, front)

        if style == "house":
            ridge = 2.8
            eave = height
            overhang_w, overhang_d = width + 1.2, depth + 1.2
            x0, x1 = x - overhang_w / 2, x + overhang_w / 2
            z0, z1 = z - overhang_d / 2, z + overhang_d / 2
            self.quad("roof_tile", [(x0, eave, z1), (x1, eave, z1),
                                    (x1, height + ridge, z), (x0, height + ridge, z)],
                      overhang_w, overhang_d)
            self.quad("roof_tile", [(x1, eave, z0), (x0, eave, z0),
                                    (x0, height + ridge, z), (x1, height + ridge, z)],
                      overhang_w, overhang_d)
            for side in (-1, 1):
                end_x = x + side * width / 2
                ridge_point = (end_x, height + ridge, z)
                self.visual.triangle_face("wall_sand",
                    (end_x, height, z - depth / 2), (end_x, height, z + depth / 2), ridge_point)
            chimney_x = x + width * 0.28
            self.box("brick", (chimney_x, height + 2.55, z - depth * 0.18), (0.9, 2.5, 0.9))
            self.box("brick", (chimney_x, height + 3.85, z - depth * 0.18), (1.1, 0.2, 1.1))
        else:
            roof_material = "roof_slate"
            self.box(roof_material, (x, height + 0.2, z), (width + 0.55, 0.4, depth + 0.55))
            for side in (-1, 1):
                self.box("trim", (x + side * (width / 2 - 0.15), height + 0.52, z),
                         (0.28, 0.46, depth + 0.3))
            self.box("metal", (x + width * 0.23, height + 0.85, z - depth * 0.12),
                     (2.1, 0.65, 1.6))

        if label:
            face_z = z + depth / 2 + 0.22
            board_width = min(width * 0.8, max(8, len(label) * 0.86))
            self.box(sign, (x, 3.65, face_z), (board_width, 1.15, 0.24))
            self.add_label(label, x, 3.42, face_z + 0.14, 0.15)
            if style == "shop":
                self.box("metal", (x, 2.72, face_z + 0.55), (board_width + 0.5, 0.12, 1.05))
                stripe_count = int(board_width // 1.5)
                for index in range(stripe_count):
                    awning_x = x - board_width / 2 + (index + 0.5) * board_width / stripe_count
                    material = "sign_cafe" if index % 2 == 0 else "trim"
                    self.box(material, (awning_x, 2.7, face_z + 0.6),
                             (board_width / stripe_count, 0.14, 1.04))

    def lamp(self, x, z):
        self.interaction_box("street_light", (x + 0.45, 2.6, z), (1.45, 5.2, 0.72))
        self.box("metal", (x, 0.24, z), (0.54, 0.48, 0.54), collision=True)
        self.box("metal", (x, 2.7, z), (0.18, 4.6, 0.18), collision=True)
        self.box("metal", (x + 0.45, 4.92, z), (1.05, 0.12, 0.14))
        self.box("metal", (x + 0.92, 4.7, z), (0.52, 0.2, 0.44))
        self.box("lamp_glow", (x + 0.92, 4.53, z), (0.3, 0.16, 0.26))

    def planter(self, x, z, flower=False):
        self.box("brick", (x, 0.34, z), (2.1, 0.68, 1.15), collision=True)
        self.box("grass", (x, 0.71, z), (1.82, 0.08, 0.88))
        for index in range(5):
            plant_x = x - 0.7 + index * 0.35
            self.visual.cylinder("foliage_dark", (plant_x, 0.98, z), 0.025, 0.02, 0.55, 6)
            self.visual.sphere("flower_red" if index % 2 else "flower_yellow",
                               (plant_x, 1.23 + (index % 2) * 0.08, z), 0.16,
                               (1, 0.85, 1), 3, 6)

    def bench(self, x, z, rotation=0):
        self.interaction_box("bench", (x, 0.65, z), (2.05, 1.25, 1.05))
        cosine, sine = math.cos(rotation), math.sin(rotation)

        def place(local_x, local_z):
            return (x + local_x * cosine - local_z * sine,
                    z + local_x * sine + local_z * cosine)

        for side in (-0.72, 0.72):
            px, pz = place(side, 0)
            self.box("metal", (px, 0.34, pz), (0.12, 0.68, 0.72), collision=True)
            px, pz = place(side, -0.3)
            self.box("metal", (px, 0.72, pz), (0.1, 0.82, 0.12), collision=True)
        for offset in (-0.27, -0.09, 0.09, 0.27):
            px, pz = place(0, offset)
            self.box("wood", (px, 0.7, pz), (1.75, 0.09, 0.14), collision=True)
        for offset in (-0.25, -0.05, 0.15, 0.35):
            px, pz = place(0, -0.32)
            self.box("wood", (px, 0.86 + offset, pz), (1.72, 0.13, 0.08))

    def tree(self, x, z, scale=1):
        trunk_height = 3.4 * scale
        self.interaction_box(
            "tree",
            (x, (trunk_height + 3.6 * scale) / 2, z),
            (5.2 * scale, trunk_height + 3.6 * scale, 4.8 * scale)
        )
        self.visual.cylinder("bark", (x, trunk_height / 2, z), 0.28 * scale,
                             0.2 * scale, trunk_height, 8)
        self.collision.box("collision", (x, trunk_height / 2, z),
                           (0.5 * scale, trunk_height, 0.5 * scale))
        crown_y = trunk_height + 1.6 * scale
        for dx, dz, radius in ((0, 0, 2.0), (-0.9, 0.15, 1.35), (0.85, -0.2, 1.4)):
            self.visual.sphere("foliage" if radius > 1.5 else "foliage_dark",
                               (x + dx * scale, crown_y, z + dz * scale),
                               radius * scale, (1, 0.9, 1), 5, 8)

    def car(self, x, z, rotation=0):
        length, width = 4.4, 1.86
        rotated = abs(math.sin(rotation)) > 0.5
        size = (width, 1.65, length) if rotated else (length, 1.65, width)
        interaction_size = (5.1, 2.1, 2.35) if not rotated else (2.35, 2.1, 5.1)
        self.interaction_box("car", (x, 0.95, z), interaction_size)
        self.collision.box("collision", (x, 0.82, z), size)

    def traffic_light(self, x, z):
        self.interaction_box("traffic_light", (x, 2.5, z), (0.85, 5.1, 0.85))
        self.box("metal", (x, 2.4, z), (0.16, 4.8, 0.16), collision=True)
        self.box("metal", (x, 4.6, z), (0.62, 1.35, 0.5))
        for index, material in enumerate(("car_red", "flower_yellow", "foliage_dark")):
            self.visual.sphere(material, (x, 4.98 - index * 0.38, z + 0.27),
                               0.14, (1, 1, 0.45), 4, 8)

    def build(self):
        self.box("grass", (0, -0.24, 30), (500, 0.48, 690), collision=True)

        streets = [
            ((30, -255), (30, 335), 15, 3.0),
            ((-220, 95), (220, 95), 14, 3.0),
            ((-185, -50), (185, -50), 11, 2.5),
            ((-140, -130), (160, -130), 11, 2.5),
            ((-215, 170), (135, 170), 12, 2.8),
            ((-155, 230), (145, 230), 12, 2.8),
            ((-150, 284), (115, 284), 14, 3.0),
            ((30, -203), (160, -203), 13, 2.8)
        ]
        for start, end, width, sidewalk in streets:
            self.street(start, end, width, sidewalk)

        self.lane_dashes(-255, 335, 30, False, (-203, -130, -50, 95, 170, 230, 284))
        for road_z, low, high in ((95, -220, 220), (-50, -185, 185),
                                  (-130, -140, 160), (170, -215, 135),
                                  (230, -155, 145), (284, -150, 115),
                                  (-203, 30, 160)):
            self.lane_dashes(low, high, road_z, True, (30,))

        for crossing in ((30, 95), (30, 170), (30, 284), (30, -203)):
            self.crosswalk(*crossing, "north")
        for crossing in ((30, 95), (30, 170), (30, 284), (30, -203)):
            self.crosswalk(*crossing, "east")

        palette = ["wall_cream", "wall_sand", "wall_sage", "wall_blue", "brick"]
        rows = [
            (-178, [-185, -130, -78, -24, 76, 126, 181]),
            (-92, [-182, -128, -75, -22, 76, 128, 181]),
            (-10, [-185, -132, -78, -22, 76, 128, 184]),
            (35, [-184, -132, -78, -22, 78, 130, 184]),
            (136, [-188, -136, -82, -25, 75, 133, 186]),
            (207, [-185, -78, -22, 5, 134, 184]),
            (260, [-202, -177, -80, -35, 0, 132, 180]),
            (318, [-184, -128, -75, -20, 72, 126, 180])
        ]
        building_index = 0
        special_zones = [
            (-131, 247, 42, 34, 3, "wall_blue", "school", "SCHULE", "sign_school"),
            (83, 244, 46, 48, 2, "wall_cream", "market", "MARKT", "sign_market"),
            (99, 145, 32, 30, 2, "wall_sand", "shop", "CAFE", "sign_cafe"),
            (140, -230, 28, 28, 2, "wall_sage", "house", "HAUS", "sign_home")
        ]

        occupied = [(x, z, w / 2 + 8, d / 2 + 8) for x, z, w, d, *_ in special_zones]
        for row_index, (z, xs) in enumerate(rows):
            for x in xs:
                if any(abs(x - ox) < half_w and abs(z - oz) < half_d
                       for ox, oz, half_w, half_d in occupied):
                    continue
                if abs(x + 170) < 40 and abs(z - 130) < 35:
                    continue
                if abs(z - 95) < 27 or abs(z - 170) < 24 or abs(z - 230) < 24:
                    continue
                width = RNG.choice((18, 21, 24, 27))
                depth = RNG.choice((19, 22, 25))
                floors = RNG.choice((2, 2, 3, 3, 4))
                if z < 95:
                    front = "north" if z < 30 else "south"
                else:
                    front = "south" if z < 170 else "north"
                style = "house" if building_index % 3 else "shop"
                wall = palette[(building_index + row_index) % len(palette)]
                roof = "roof_tile" if building_index % 3 else "roof_slate"
                self.building(x, z, width, depth, floors, wall, roof, style, front)
                occupied.append((x, z, width / 2 + 5, depth / 2 + 5))
                building_index += 1

        for x, z, width, depth, floors, wall, style, label, sign in special_zones:
            roof = "roof_tile" if style == "house" else "roof_slate"
            self.building(x, z, width, depth, floors, wall, roof, style,
                          "north", label, sign)

        lamp_positions = [
            (42, -224), (42, -171), (42, -92), (42, -20), (42, 34),
            (42, 138), (42, 216), (42, 315), (-205, 177), (120, 177),
            (-145, 291), (101, 291), (151, -188)
        ]
        for position in lamp_positions:
            self.lamp(*position)

        tree_positions = [
            (-203, -169), (-150, -169), (-92, -169), (85, -169), (151, -169),
            (-200, -83), (-150, -83), (-95, -83), (86, -83), (150, -83),
            (-200, -20), (-145, -20), (-93, -20), (88, -20), (150, -20),
            (-205, 39), (-150, 39), (-95, 39), (145, 39), (205, 39),
            (-206, 132), (-155, 132), (-94, 132), (146, 132), (201, 132),
            (-205, 196), (-190, 258), (180, 258), (-190, 318), (180, 318)
        ]
        for index, (x, z) in enumerate(tree_positions):
            self.tree(x, z, 0.82 + (index % 4) * 0.1)

        for x, z in ((46, 111), (46, 155), (45, 219), (-164, 220),
                     (150, -194), (-205, 95), (207, 95), (180, 284)):
            self.planter(x, z, True)

        self.bench(-166, 142, math.pi / 2)
        self.bench(-183, 146, 0)
        self.bench(49, 116, math.pi / 2)
        self.bench(128, 163, math.pi / 2)
        self.bench(122, 275, math.pi / 2)

        self.box("grass", (-170, 0.015, 130), (62, 0.08, 50))
        self.interaction_box("park", (-170, 0.12, 130), (62, 0.08, 50))
        for x, z in ((-190, 112), (-170, 112), (-150, 112), (-190, 136),
                     (-150, 136), (-180, 148), (-160, 148)):
            self.tree(x, z, 0.75)
        self.box("water", (-170, 0.08, 133), (14, 0.09, 9))
        for index in range(16):
            angle = 2 * math.pi * index / 16
            self.box("sidewalk", (-170 + math.cos(angle) * 9, 0.17,
                                  133 + math.sin(angle) * 6),
                     (1.4, 0.24, 1.4))

        self.traffic_light(39, 101)
        self.traffic_light(39, 176)
        self.traffic_light(39, -197)
        self.car(-75, 91)
        self.car(152, 99)
        self.car(33, 18, math.pi / 2)
        self.car(33, -94, math.pi / 2)

        return self.visual, self.collision


def png_chunk(chunk_type, data):
    return (struct.pack(">I", len(data)) + chunk_type + data
            + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF))


def _hash01(x, y, seed):
    value = (x * 374761393 + y * 668265263 + seed * 1442695041) & 0xFFFFFFFF
    value = ((value ^ (value >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((value ^ (value >> 16)) & 0xFFFFFFFF) / 0xFFFFFFFF


def _smoothstep(value):
    return value * value * (3 - 2 * value)


def _value_noise(x, y, seed, cells, width, height):
    gx, gy = x * cells / width, y * cells / height
    x0, y0 = int(gx), int(gy)
    fx, fy = gx - x0, gy - y0
    sx, sy = _smoothstep(fx), _smoothstep(fy)
    n00 = _hash01(x0 % cells, y0 % cells, seed)
    n10 = _hash01((x0 + 1) % cells, y0 % cells, seed)
    n01 = _hash01(x0 % cells, (y0 + 1) % cells, seed)
    n11 = _hash01((x0 + 1) % cells, (y0 + 1) % cells, seed)
    return (n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy)
            + n01 * (1 - sx) * sy + n11 * sx * sy)


def _clamp_channel(value):
    return max(0, min(255, int(value)))


def texture_png(kind, seed, width=256, height=256):
    pixels = bytearray()
    for y in range(height):
        for x in range(width):
            fine = _hash01(x, y, seed)
            coarse = _value_noise(x, y, seed + 17, 16, width, height)
            mid = _value_noise(x, y, seed + 31, 48, width, height)
            if kind == "asphalt":
                base = 99 + (coarse - 0.5) * 20 + (mid - 0.5) * 12
                if fine < 0.075:
                    base += 34
                elif fine > 0.945:
                    base -= 26
                color = (base, base + 2, base + 1)
            elif kind == "stone":
                course, block = 32, 64
                row = y // course
                offset = block // 2 if row % 2 else 0
                sx = (x + offset) % block
                seam = y % course < 3 or sx < 3
                tone = (coarse - 0.5) * 10 + (fine - 0.5) * 8
                if seam:
                    base = 126 + tone
                else:
                    base = (172 + tone
                            + (_hash01((x + offset) // block, row, seed) - 0.5) * 14)
                    if y % course < 6 or sx < 6:
                        base += 5
                color = (base + 3, base + 1, base - 4)
            elif kind == "brick":
                course, block = 24, 52
                row = y // course
                offset = block // 2 if row % 2 else 0
                sx = (x + offset) % block
                mortar = y % course < 3 or sx < 3
                if mortar:
                    base = 201 + (fine - 0.5) * 8
                    color = (base, base - 6, base - 18)
                else:
                    base = (158 + (coarse - 0.5) * 14 + (fine - 0.5) * 10
                            + (_hash01((x + offset) // block, row, seed) - 0.5) * 26)
                    color = (base + 16, base - 46, base - 58)
            elif kind == "roof":
                course, block = 22, 38
                row = y // course
                offset = block // 2 if row % 2 else 0
                sx = (x + offset) % block
                edge = y % course < 2 or sx < 2
                if edge:
                    base = 132 + (fine - 0.5) * 8
                else:
                    base = (98 + (coarse - 0.5) * 12 + (fine - 0.5) * 8
                            + (_hash01((x + offset) // block, row, seed) - 0.5) * 18)
                color = (base + 20, base - 3, base - 11)
            elif kind == "glass":
                gradient = y / height
                reflection = 26 if (x * 3 + y) % 97 < 2 else 0
                color = (73 + 28 * (1 - gradient) + reflection,
                         109 + 34 * (1 - gradient) + reflection,
                         124 + 36 * (1 - gradient) + reflection)
            elif kind == "wood":
                ring = math.sin(x * 0.23 + coarse * 6.5) * 9
                grain = -10 if (x + y * 5) % 41 < 2 else 0
                base = 150 + ring + (fine - 0.5) * 12 + grain
                color = (base, base - 38, base - 74)
            elif kind == "grass":
                blade = (fine - 0.5) * 26 + (mid - 0.5) * 20
                base = 112 + coarse * 26 + blade
                color = (base * 0.76, base, base * 0.64)
            else:
                base = 232 + (coarse - 0.5) * 10 + (mid - 0.5) * 5 + (fine - 0.5) * 5
                color = (base, base - 5, base - 16)
            pixels.extend(_clamp_channel(component) for component in color)
            pixels.append(255)
    scanlines = b"".join(b"\x00" + pixels[y * width * 4:(y + 1) * width * 4]
                         for y in range(height))
    header = struct.pack(">2I5B", width, height, 8, 6, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", header)
            + png_chunk(b"IDAT", zlib.compress(scanlines, 7)) + png_chunk(b"IEND", b""))

def write_glb(path, geometry, collision=False, include_textures=True, materials=None):
    binary = bytearray()
    buffer_views = []
    accessors = []
    meshes = []
    nodes = []
    gltf_materials = []
    images = []
    textures = []
    samplers = []
    material_indices = {}
    texture_indices = {}

    def add_blob(data, target=None):
        while len(binary) % 4:
            binary.append(0)
        offset = len(binary)
        binary.extend(data)
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
        if target:
            view["target"] = target
        buffer_views.append(view)
        return len(buffer_views) - 1

    if collision:
        material_indices["collision"] = 0
        gltf_materials.append({
            "name": "Collision",
            "doubleSided": True,
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.8, 0.8, 0.8, 1],
                "metallicFactor": 0,
                "roughnessFactor": 1
            }
        })
    else:
        material_source = materials or MATERIALS
        for index, (name, spec) in enumerate(material_source.items()):
            material = {
                "name": name,
                "doubleSided": True,
                "pbrMetallicRoughness": {
                    "baseColorFactor": [*spec["color"], 1],
                    "metallicFactor": spec.get("metallic", 0),
                    "roughnessFactor": spec["roughness"]
                }
            }
            if "emissive" in spec:
                material["emissiveFactor"] = spec["emissive"]
            if include_textures and "texture" in spec:
                kind = spec["texture"]
                if kind not in texture_indices:
                    if not samplers:
                        samplers.append({"magFilter": 9729, "minFilter": 9987,
                                         "wrapS": 10497, "wrapT": 10497})
                    image_data = texture_png(kind, 1000 + len(texture_indices))
                    image_view = add_blob(image_data)
                    images.append({
                        "name": f"{kind}_texture",
                        "bufferView": image_view,
                        "mimeType": "image/png"
                    })
                    textures.append({"sampler": 0, "source": len(images) - 1})
                    texture_indices[kind] = len(textures) - 1
                material["pbrMetallicRoughness"]["baseColorTexture"] = {
                    "index": texture_indices[kind]
                }
            material_indices[name] = index
            gltf_materials.append(material)

        for key in INTERACTION_KEYS:
            material_indices[f"interaction_{key}"] = len(gltf_materials)
            gltf_materials.append({
                "name": f"interaction_{key}",
                "alphaMode": "MASK",
                "alphaCutoff": 0.5,
                "doubleSided": True,
                "pbrMetallicRoughness": {
                    "baseColorFactor": [1, 1, 1, 0],
                    "metallicFactor": 0,
                    "roughnessFactor": 1
                }
            })

    active_materials = ["collision"] if collision else list(geometry.vertices)
    for material_name in active_materials:
        values = geometry.vertices.get(material_name, [])
        if not values:
            continue
        unique = []
        indices = []
        lookup = {}
        for value in values:
            key = tuple(round(component, 6) for component in value)
            vertex_index = lookup.get(key)
            if vertex_index is None:
                vertex_index = len(unique)
                lookup[key] = vertex_index
                unique.append(value)
            indices.append(vertex_index)
        positions = [value[:3] for value in unique]
        uvs = [value[6:8] for value in unique]
        position_bytes = struct.pack(f"<{len(positions) * 3}f",
                                     *(component for point in positions for component in point))
        normal_bytes = struct.pack(f"<{len(unique) * 3}h",
                                   *(max(-32767, min(32767, round(value[axis + 3] * 32767)))
                                     for value in unique for axis in range(3)))
        uv_bytes = struct.pack(f"<{len(uvs) * 2}f",
                               *(component for uv in uvs for component in uv))
        position_view = add_blob(position_bytes, 34962)
        normal_view = add_blob(normal_bytes, 34962)
        uv_view = add_blob(uv_bytes, 34962)
        index_type = 5123 if len(unique) <= 65535 else 5125
        index_bytes = (struct.pack(f"<{len(indices)}H", *indices) if index_type == 5123
                       else struct.pack(f"<{len(indices)}I", *indices))
        index_view = add_blob(index_bytes, 34963)
        position_accessor = len(accessors)
        accessors.append({
            "bufferView": position_view,
            "componentType": 5126,
            "count": len(positions),
            "type": "VEC3",
            "min": [min(point[axis] for point in positions) for axis in range(3)],
            "max": [max(point[axis] for point in positions) for axis in range(3)]
        })
        normal_accessor = len(accessors)
        accessors.append({
            "bufferView": normal_view,
            "componentType": 5122,
            "normalized": True,
            "count": len(positions),
            "type": "VEC3"
        })
        uv_accessor = len(accessors)
        accessors.append({
            "bufferView": uv_view,
            "componentType": 5126,
            "count": len(uvs),
            "type": "VEC2"
        })
        index_accessor = len(accessors)
        accessors.append({
            "bufferView": index_view,
            "componentType": index_type,
            "count": len(indices),
            "type": "SCALAR",
            "min": [min(indices)],
            "max": [max(indices)]
        })
        interactive = material_name.startswith("interaction_")
        object_name = f"I_{material_name.removeprefix('interaction_')}" if interactive \
            else f"city_{material_name}"
        meshes.append({
            "name": object_name,
            "primitives": [{
                "attributes": {
                    "POSITION": position_accessor,
                    "NORMAL": normal_accessor,
                    "TEXCOORD_0": uv_accessor
                },
                "indices": index_accessor,
                "material": material_indices[material_name],
                "mode": 4
            }]
        })
        nodes.append({
            "name": "city_Collision" if collision else object_name,
            "mesh": len(meshes) - 1
        })

    doc = {
        "asset": {"version": "2.0", "generator": "LinguaWorld Procedural City"},
        "scene": 0,
        "scenes": [{"name": "LinguaWorld City", "nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": gltf_materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(binary)}]
    }
    if images:
        doc["images"] = images
        doc["textures"] = textures
        doc["samplers"] = samplers

    json_chunk = json.dumps(doc, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    json_chunk += b" " * ((4 - len(json_chunk) % 4) % 4)
    binary.extend(b"\x00" * ((4 - len(binary) % 4) % 4))
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary)
    with path.open("wb") as file:
        file.write(struct.pack("<4sII", b"glTF", 2, total_length))
        file.write(struct.pack("<I4s", len(json_chunk), b"JSON"))
        file.write(json_chunk)
        file.write(struct.pack("<I4s", len(binary), b"BIN\x00"))
        file.write(binary)


def compress_glb(path):
    compressed = path.with_name(path.stem + ".draco.glb")
    subprocess.run(
        ["npx", "--yes", "@gltf-transform/cli", "draco", str(path), str(compressed)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    compressed.replace(path)


def compress_glbs(paths):
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(compress_glb, paths))


def main():
    GROUND_DIR.mkdir(parents=True, exist_ok=True)
    city = City()
    visual, collision = city.build()
    visual_path = GROUND_DIR / "LinguaCity.glb"
    collision_path = GROUND_DIR / "LinguaCity_Collision.glb"
    write_glb(visual_path, visual)
    write_glb(collision_path, collision, collision=True)
    compress_glbs([visual_path, collision_path])
    print(f"Generated {len(visual.vertices)} visual materials and "
          f"{len(city.buildings)} buildings.")


if __name__ == "__main__":
    main()
