// Matrix formatting utility
export function mat4ToString(m) {
  // Convert 4x4 matrix to formatted string
    return [
      `${m[0].toFixed(2)} ${m[1].toFixed(2)} ${m[2].toFixed(2)} ${m[3].toFixed(2)}`,
      `${m[4].toFixed(2)} ${m[5].toFixed(2)} ${m[6].toFixed(2)} ${m[7].toFixed(2)}`,
      `${m[8].toFixed(2)} ${m[9].toFixed(2)} ${m[10].toFixed(2)} ${m[11].toFixed(2)}`,
      `${m[12].toFixed(2)} ${m[13].toFixed(2)} ${m[14].toFixed(2)} ${m[15].toFixed(2)}`,
    ].join("\n");
  }
