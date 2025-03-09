import {
  perspective,
  rotationX,
  rotationY,
  multiplyMatrices,
  translation,
} from "./math/mat4x4.js";

// Transformation matrix controller
export class TransformController {
  static CAMERA_FOV = Math.PI / 4;
  static NEAR_CLIP = 0.1;
  static FAR_CLIP = 1000;

  constructor(input, webGPUContext) {
    this.input = input;
    this.webGPU = webGPUContext;
  }

  updateTransforms() {
    const aspect = this.webGPU.canvas.width / this.webGPU.canvas.height;
    const { modelCenter } = this.webGPU;

    const modelMatrix = this.createModelMatrix(modelCenter);
    const viewMatrix = translation(0, 0, -this.input.cameraZ);
    const projMatrix = perspective(
      TransformController.CAMERA_FOV,
      aspect,
      TransformController.NEAR_CLIP,
      TransformController.FAR_CLIP
    );

    const mvp = multiplyMatrices(
      multiplyMatrices(modelMatrix, viewMatrix),
      projMatrix
    );
    this.updateUniforms(mvp, modelMatrix);
  }

  createModelMatrix(center) {
    const modelTranslation = translation(-center[0], -center[1], -center[2]);
    return multiplyMatrices(
      modelTranslation,
      multiplyMatrices(
        rotationX(this.input.rotXAngle),
        rotationY(this.input.rotYAngle)
      )
    );
  }

  updateUniforms(mvpMatrix, modelMatrix) {
    const cameraPos = [0, 0, this.input.cameraZ];

    const modelRadius = this.webGPU.modelData.radius;

    // Convert to spherical coordinates
    const theta = this.input.lightAzimuth * (Math.PI / 180);
    const phi = this.input.lightElevation * (Math.PI / 180);
    const distance = modelRadius * this.input.lightDistance;

    // Calculate light position
    const lightPos = [
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.cos(phi),
      distance * Math.sin(phi) * Math.sin(theta),
    ];

    const buffer = new Float32Array(56);
    buffer.set(mvpMatrix, 0);
    buffer.set(modelMatrix, 16);
    buffer.set([...cameraPos, 0], 32);
    buffer.set([...lightPos, 0], 36);

    buffer.set(this.input.ambientColor, 40);
    buffer.set(this.input.diffuseColor, 44);
    buffer.set(this.input.specularColor, 48);
    buffer.set([this.input.specularPower, 0, 0, 0], 52);

    this.webGPU.device.queue.writeBuffer(
      this.webGPU.uniformBuffer,
      0,
      buffer.buffer
    );
  }
}
