import { BufferManager } from "./buffer-manager.js";
import { PipelineManager } from "./pipeline-manager.js";
import { TextureManager } from "./texture-manager.js";

export class WebGPUContext {
  static VERTEX_STRIDE = 32; // 3(pos) + 3(normal) + 2(texcoord) = 8 floats (32 bytes)
  static DEPTH_FORMAT = "depth24plus";

  constructor(canvas) {
    this.canvas = canvas;
    this.device = null;
    this.pipeline = null;
    this.uniformBuffer = null;
    this.depthTexture = null;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.bindGroup = null;
    this.modelData = null;
    this.modelCenter = [0, 0, 0];

    // Create instances of helper managers.
    this.bufferManager = new BufferManager(this);
    this.pipelineManager = new PipelineManager(this);
    this.textureManager = new TextureManager(this);
  }

  async initialize() {
    try {
      await this.initializeDevice();
      await this.configureCanvasContext();
      return this.device;
    } catch (error) {
      this.cleanup();
      throw new Error(`WebGPU initialization failed: ${error.message}`);
    }
  }

  async initializeDevice() {
    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter.requestDevice();
  }

  async configureCanvasContext() {
    const context = this.canvas.getContext("webgpu");
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
      device: this.device,
      format: format,
      alphaMode: "premultiplied",
    });

    this.textureManager.createDepthTexture();
  }

  cleanup() {
    [
      this.vertexBuffer,
      this.indexBuffer,
      this.uniformBuffer,
      this.depthTexture,
    ].forEach((resource) => resource?.destroy());
  }

  resize() {
    this.textureManager.createDepthTexture();
  }

  createModelBuffers(model) {
    this.modelData = model;
    this.modelCenter = model.center;
    this.bufferManager.createVertexBuffer();
    this.bufferManager.createIndexBuffer();
    this.bufferManager.createUniformBuffer();
  }

  async createRenderPipeline(shaderModule) {
    const bindGroupLayout = this.pipelineManager.createBindGroupLayout();
    this.pipelineManager.createBindGroup(bindGroupLayout);

    this.pipeline = this.device.createRenderPipeline({
      layout: this.pipelineManager.createPipelineLayout(bindGroupLayout),
      vertex: this.pipelineManager.createVertexState(shaderModule),
      fragment: this.pipelineManager.createFragmentState(shaderModule),
      primitive: this.pipelineManager.createPrimitiveState(),
      depthStencil: this.pipelineManager.createDepthStencilState(),
    });
  }
}
