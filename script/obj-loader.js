import { crossProduct, normalize, addVectors } from "./math/vec3.js";

// Helper functions for OBJ parsing
const parseOBJLine = (line) => line.trim().split(/\s+/);
const createBoundingBox = () => ({
  min: [Infinity, Infinity, Infinity],
  max: [-Infinity, -Infinity, -Infinity]
});

export class OBJLoader {
  static async loadModel(device, url) {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split("\n");

    // Geometry data stores
    const state = {
      positions: [],
      texcoords: [],
      normals: [],
      vertices: [],
      indices: [],
      indexMap: new Map(),
      faceTriangles: [],
      bounds: createBoundingBox()
    };

    // First pass: parse geometry and triangulate faces
    this.parseGeometry(lines, state);

    // Calculate normals if missing
    if (state.normals.length === 0) {
      this.calculateVertexNormals(state);
    }

    // Second pass: build interleaved vertex buffer
    this.buildVertexBuffer(state);

    return {
      vertexData: new Float32Array(state.vertices),
      indexData: new Uint32Array(state.indices),
      center: this.calculateCenter(state.bounds),
      radius: this.calculateBoundingRadius(state.bounds)
    };
  }

  static parseGeometry(lines, state) {
    for (const line of lines) {
      const parts = parseOBJLine(line);
      if (parts.length === 0) continue;

      switch (parts[0]) {
        case "v":  this.parseVertex(parts, state); break;
        case "vt": this.parseTexCoord(parts, state); break;
        case "vn": this.parseNormal(parts, state); break;
        case "f":  this.parseFace(parts, state); break;
      }
    }
  }

  static parseVertex(parts, state) {
    const position = parts.slice(1, 4).map(Number);
    state.positions.push(position);
    
    // Update bounding box
    state.bounds.min = state.bounds.min.map((v, i) => Math.min(v, position[i]));
    state.bounds.max = state.bounds.max.map((v, i) => Math.max(v, position[i]));
  }

  static parseTexCoord(parts, state) {
    state.texcoords.push(parts.slice(1, 3).map(Number));
  }

  static parseNormal(parts, state) {
    state.normals.push(parts.slice(1, 4).map(Number));
  }

  static parseFace(parts, state) {
    const faceVertices = parts.slice(1).map(v => {
      return v.split("/").map(str => {
        const num = parseInt(str, 10);
        return isNaN(num) ? 0 : num;
      });
    });

    // Triangulate n-gon into triangles
    for (let i = 2; i < faceVertices.length; i++) {
      state.faceTriangles.push([
        faceVertices[0],
        faceVertices[i - 1],
        faceVertices[i]
      ]);
    }
  }

  static calculateVertexNormals(state) {
    const vertexNormals = new Array(state.positions.length)
      .fill().map(() => [0, 0, 0]);

    for (const triangle of state.faceTriangles) {
      const [v0, v1, v2] = triangle.map(t => this.parseIndex(t[0], state.positions));
      const normal = this.calculateFaceNormal(
        state.positions[v0],
        state.positions[v1],
        state.positions[v2]
      );

      [v0, v1, v2].forEach(vi => {
        vertexNormals[vi] = addVectors(vertexNormals[vi], normal);
      });
    }

    // Normalize and store
    state.normals = vertexNormals.map(n => {
      normalize(n);
      return n;
    });
  }

  static calculateFaceNormal(p0, p1, p2) {
    const vecA = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const vecB = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
    const normal = crossProduct(vecA, vecB);
    return normalize(normal);
  }

  static buildVertexBuffer(state) {
    const vertexSize = 8; // 3 pos + 3 normal + 2 texcoord

    for (const triangle of state.faceTriangles) {
      for (const vertexDef of triangle) {
        const [posIdx, texIdx, normIdx] = vertexDef;

        const posIndex = this.parseIndex(posIdx, state.positions);
        const texIndex = texIdx ? this.parseIndex(texIdx, state.texcoords) : null;
        const normIndex = normIdx ? this.parseIndex(normIdx, state.normals) : posIndex;

        const key = `${posIndex}/${texIndex}/${normIndex}`;

        if (!state.indexMap.has(key)) {
          const position = state.positions[posIndex];
          const normal = state.normals[normIndex];
          const texCoord = texIndex !== null ? state.texcoords[texIndex] : [0, 0];
          
          state.vertices.push(...position, ...normal, ...texCoord);
          state.indexMap.set(key, state.vertices.length / vertexSize - 1);
        }

        state.indices.push(state.indexMap.get(key));
      }
    }
  }

  static calculateCenter(bounds) {
    return bounds.min.map((minVal, i) => (minVal + bounds.max[i]) / 2);
  }

  static calculateBoundingRadius(bounds) {
    const diagonal = bounds.max.reduce(
      (sum, val, i) => sum + (val - bounds.min[i]) ** 2, 0
    );
    return Math.sqrt(diagonal) / 2;
  }

  static parseIndex(index, array) {
    return index < 0 ? array.length + index : index - 1;
  }
}