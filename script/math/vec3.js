// math_vec3.js

export function crossProduct(a, b) {
  validateVector(a, 'crossProduct', 'first');
  validateVector(b, 'crossProduct', 'second');
  
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function normalize(v) {
  validateVector(v, 'normalize');
  
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  
  if (len <= Number.EPSILON) {
    throw new Error(
      `normalize: Cannot normalize zero-length vector [${v}]. ` +
      'Check input vectors for valid magnitudes.'
    );
  }

  return [v[0] / len, v[1] / len, v[2] / len];
}

export function addVectors(a, b) {
  validateVector(a, 'addVectors', 'first');
  validateVector(b, 'addVectors', 'second');

  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

// Shared validation utility
function validateVector(vec, operation, vectorName = 'input') {
  if (!Array.isArray(vec)) {
    throw new TypeError(
      `${operation}: ${vectorName} must be an array. ` +
      `Received type: ${typeof vec}`
    );
  }
  
  if (vec.length !== 3) {
    throw new RangeError(
      `${operation}: ${vectorName} must contain exactly 3 elements. ` +
      `Received length: ${vec.length}`
    );
  }

  vec.forEach((val, index) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      throw new TypeError(
        `${operation}: Invalid ${vectorName} vector element at index ${index}. ` +
        `Must be a finite number. Received: ${val} (${typeof val})`
      );
    }
  });
}