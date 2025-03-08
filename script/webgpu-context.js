export class WebGPUContext {
  constructor(canvas) {
    // WebGPU resources
    this.canvas = canvas;
    this.device = null; // GPU device
    this.pipeline = null; // Render pipeline
    this.uniformBuffer = null; // Matrix storage
    this.depthTexture = null; // Depth buffer
    this.vertexBuffer = null; // Geometry data
    this.indexBuffer = null; // Index data
    this.bindGroup = null; // Resource bindings
  }

  // Initialize WebGPU context
  async initialize() {
    try {
      // Adapter/device setup
      const adapter = await navigator.gpu.requestAdapter();
      this.device = await adapter.requestDevice();

      // Canvas configuration
      const context = this.canvas.getContext("webgpu");
      const format = navigator.gpu.getPreferredCanvasFormat();

      context.configure({
        device: this.device,
        format: format,
        alphaMode: "premultiplied",
      });

      this.createDepthTexture();
      return this.device;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  cleanup() {
    this.vertexBuffer?.destroy();
    this.indexBuffer?.destroy();
    this.uniformBuffer?.destroy();
    this.depthTexture?.destroy();
  }

  // Handle window resize
  resize() {
    this.createDepthTexture();
  }

  // Create vertex/index/uniform buffers
  async createBuffers(model) {

    this.modelCenter = model.center;
    this.modelRadius = model.radius;

    if (model.vertexData.length === 0 || model.indexData.length === 0) {
      throw new Error("Invalid model data");
    }

    // Create uniform buffer
    this.uniformBuffer = this.device.createBuffer({
    size: 160, // mat4x4 (16 floats * 4 bytes * 2 + 2 * 3 floats * 4 bytes)
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Vertex buffer
    this.vertexBuffer = this.device.createBuffer({
      size: model.vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(model.vertexData);
    this.vertexBuffer.unmap();

    // Index buffer
    this.indexBuffer = this.device.createBuffer({
      size: model.indexData.byteLength,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });
    new Uint32Array(this.indexBuffer.getMappedRange()).set(model.indexData);
    this.indexBuffer.unmap();
  }

  // Create/recreate depth texture
  createDepthTexture() {
    if (this.depthTexture) this.depthTexture.destroy();
    this.depthTexture = this.device.createTexture({
      size: [this.canvas.width, this.canvas.height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  // Create render pipeline
  async createPipeline(shaderModule) {
    // Bind group layout for uniforms
    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    // Pipeline configuration
    this.pipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      // Vertex shaders
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x3" }, // Position
              { shaderLocation: 1, offset: 12, format: "float32x3" }, // Normal
              { shaderLocation: 2, offset: 24, format: "float32x2" }, // Texcoord
            ],
            arrayStride: 32, // 3(pos) + 3(normal) + 2(texcoord) = 8 floats (32 bytes)
            stepMode: "vertex",
          },
        ],
      },
      // Fragment shaders
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
      },
      // Render settings
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
    });
  }
}
