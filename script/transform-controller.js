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
    const lightPos = [0, this.input.cameraZ * 0.5, this.input.cameraZ];

    const buffer = new Float32Array(40);
    buffer.set(mvpMatrix, 0);
    buffer.set(modelMatrix, 16);
    buffer.set([...cameraPos, 0], 32);
    buffer.set([...lightPos, 0], 36);

    this.webGPU.device.queue.writeBuffer(
      this.webGPU.uniformBuffer,
      0,
      buffer.buffer
    );
  }
}
