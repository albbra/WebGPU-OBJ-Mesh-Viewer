// math_mat4x4.js
// Matrix math utilities for 4x4 transformations with validation

const MAT4_SIZE = 16;

function validateMatrix(m, operation, matrixName = 'matrix') {
  if (!Array.isArray(m)) {
    throw new TypeError(
      `${operation}: ${matrixName} must be an array. ` +
      `Received type: ${typeof m}`
    );
  }
  
  if (m.length !== MAT4_SIZE) {
    throw new RangeError(
      `${operation}: ${matrixName} must contain exactly ${MAT4_SIZE} elements. ` +
      `Received length: ${m.length}`
    );
  }

  m.forEach((val, index) => {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      throw new TypeError(
        `${operation}: Invalid ${matrixName} element at index ${index}. ` +
        `Must be finite number. Received: ${val}`
      );
    }
  });
}

function validateNumber(value, operation, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(
      `${operation}: ${name} must be a finite number. ` +
      `Received: ${value} (${typeof value})`
    );
  }
}

// Creates perspective projection matrix with validation
export function perspective(fovy, aspect, near, far) {
  validateNumber(fovy, 'perspective', 'fovy');
  validateNumber(aspect, 'perspective', 'aspect');
  validateNumber(near, 'perspective', 'near');
  validateNumber(far, 'perspective', 'far');

  if (fovy <= 0 || fovy >= Math.PI) {
    throw new RangeError(
      `perspective: fovy must be between 0 and π radians. ` +
      `Received: ${fovy}`
    );
  }

  if (aspect <= 0) {
    throw new RangeError(
      `perspective: aspect ratio must be positive. ` +
      `Received: ${aspect}`
    );
  }

  if (near <= 0 || far <= 0) {
    throw new RangeError(
      `perspective: near and far planes must be positive. ` +
      `Received: near=${near}, far=${far}`
    );
  }

  if (near >= far) {
    throw new RangeError(
      `perspective: near plane must be less than far plane. ` +
      `Received: near=${near}, far=${far}`
    );
  }

  const f = 1.0 / Math.tan(fovy / 2);
  const rangeInv = 1.0 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * rangeInv, -1,
    0, 0, (2 * far * near) * rangeInv, 0,
  ];
}

export function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function multiplyMatrices(a, b) {
  validateMatrix(a, 'multiplyMatrices', 'first matrix');
  validateMatrix(b, 'multiplyMatrices', 'second matrix');

  const out = new Array(MAT4_SIZE).fill(0);
  for (let row = 0; row < 4; ++row) {
    for (let col = 0; col < 4; ++col) {
      for (let k = 0; k < 4; ++k) {
        out[row * 4 + col] += a[row * 4 + k] * b[k * 4 + col];
      }
    }
  }
  return out;
}

export function rotationX(angle) {
  validateNumber(angle, 'rotationX', 'angle');
  
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
}

export function rotationY(angle) {
  validateNumber(angle, 'rotationY', 'angle');
  
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}

export function translation(tx, ty, tz) {
  [tx, ty, tz].forEach((val, i) => 
    validateNumber(val, 'translation', ['tx', 'ty', 'tz'][i])
  );

  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

export function transposeMatrix(m) {
  validateMatrix(m, 'transposeMatrix');

  return [
    m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15],
  ];
}

export function scaleMatrix(m, factor) {
  validateMatrix(m, 'scaleMatrix');
  validateNumber(factor, 'scaleMatrix', 'scaling factor');

  const scaleMat = [
    factor, 0, 0, 0,
    0, factor, 0, 0,
    0, 0, factor, 0,
    0, 0, 0, 1
  ];
  return multiplyMatrices(scaleMat, m);
}