export class TextureManager {
    constructor(context) {
      this.context = context;
    }
  
    createDepthTexture() {
      // Destroy the previous texture if it exists.
      if (this.context.depthTexture) {
        this.context.depthTexture.destroy();
      }
      this.context.depthTexture = this.context.device.createTexture({
        size: [this.context.canvas.width, this.context.canvas.height],
        format: this.context.constructor.DEPTH_FORMAT,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }
  }
  