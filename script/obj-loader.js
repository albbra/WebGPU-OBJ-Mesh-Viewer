import { crossProduct, normalize, addVectors } from "./math/vec3.js";

export class OBJLoader {
  static async loadModel(device, url) {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split("\n");

    // Data storage
    const positions = [];
    const texcoords = [];
    const normals = [];
    const vertices = [];
    const indices = [];
    const indexMap = new Map();

    // Temporary storage for face processing
    const faceTriangles = [];
    const positionIndicesMap = new Map();

    // Bounding box tracking
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];

    // First pass: collect geometry and faces
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 1) continue;

      switch (parts[0]) {
        case "v": {
          const pos = parts.slice(1, 4).map(Number);
          positions.push(pos);
          min = min.map((v, i) => Math.min(v, pos[i]));
          max = max.map((v, i) => Math.max(v, pos[i]));
          break;
        }
        case "vt": {
          texcoords.push(parts.slice(1, 3).map(Number));
          break;
        }
        case "vn": {
          normals.push(parts.slice(1, 4).map(Number));
          break;
        }
        case "f": {
          const faceVerts = [];
          for (let i = 1; i < parts.length; i++) {
            const indices = parts[i].split("/").map((str) => {
              const num = parseInt(str, 10);
              return isNaN(num) ? 0 : num;
            });
            faceVerts.push(indices);
          }
          // Triangulate face
          for (let i = 2; i < faceVerts.length; i++) {
            faceTriangles.push([faceVerts[0], faceVerts[i - 1], faceVerts[i]]);
          }
          break;
        }
      }
    }

    // Calculate normals if missing
    if (normals.length === 0) {
      const vertexNormals = new Array(positions.length)
        .fill()
        .map(() => [0, 0, 0]);

      for (const triangle of faceTriangles) {
        // Get position indices for the triangle
        const v0 = this.parseIndex(triangle[0][0], positions);
        const v1 = this.parseIndex(triangle[1][0], positions);
        const v2 = this.parseIndex(triangle[2][0], positions);

        // Calculate face normal
        const p0 = positions[v0];
        const p1 = positions[v1];
        const p2 = positions[v2];

        const vecA = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        const vecB = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
        const normal = crossProduct(vecA, vecB);
        normalize(normal);

        // Accumulate normals for each vertex
        vertexNormals[v0] = addVectors(vertexNormals[v0], normal);
        vertexNormals[v1] = addVectors(vertexNormals[v1], normal);
        vertexNormals[v2] = addVectors(vertexNormals[v2], normal);
      }

      // Normalize and store computed normals
      normals.length = 0;
      vertexNormals.forEach((n) => {
        normalize(n);
        normals.push(n);
      });
    }

    // Second pass: build vertex data
    for (const triangle of faceTriangles) {
      for (const vertexDef of triangle) {
        const [posIdx, texIdx, normIdx] = vertexDef;

        // Handle indices with proper OBJ indexing
        const posIndex = this.parseIndex(posIdx, positions);
        const texIndex = texIdx ? this.parseIndex(texIdx, texcoords) : null;
        const normIndex = normIdx
          ? this.parseIndex(normIdx, normals)
          : posIndex;

        // Get actual data
        const pos = positions[posIndex];
        const tex = texIndex !== null ? texcoords[texIndex] : [0, 0];
        const nor = normals[normIndex];

        // Create unique key for this vertex combination
        const key = `${posIndex}/${texIndex}/${normIndex}`;

        if (!indexMap.has(key)) {
          vertices.push(...pos, ...nor, ...tex);
          indexMap.set(key, vertices.length / 8 - 1);
        }
        indices.push(indexMap.get(key));
      }
    }

    // Rest of the existing code...
    return {
      vertexData: new Float32Array(vertices),
      indexData: new Uint32Array(indices),
      center: min.map((minVal, i) => (minVal + max[i]) / 2),
      radius:
        Math.sqrt(max.reduce((sum, val, i) => sum + (val - min[i]) ** 2, 0)) /
        2,
    };
  }

  // Helper methods
  static parseIndex(index, array) {
    if (index < 0) return array.length + index;
    return index - 1;
  }
}
