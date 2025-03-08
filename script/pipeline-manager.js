export class PipelineManager {
  constructor(context) {
    this.context = context;
  }

  createBindGroupLayout() {
    return this.context.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });
  }

  createBindGroup(layout) {
    this.context.bindGroup = this.context.device.createBindGroup({
      layout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.context.uniformBuffer },
        },
      ],
    });
  }

  createPipelineLayout(bindGroupLayout) {
    return this.context.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });
  }

  createVertexState(shaderModule) {
    return {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: this.context.constructor.VERTEX_STRIDE,
          stepMode: "vertex",
          attributes: [
            {
              // Position
              shaderLocation: 0,
              offset: 0,
              format: "float32x3",
            },
            {
              // Normal
              shaderLocation: 1,
              offset: 12,
              format: "float32x3",
            },
            {
              // TexCoord
              shaderLocation: 2,
              offset: 24,
              format: "float32x2",
            },
          ],
        },
      ],
    };
  }

  createFragmentState(shaderModule) {
    return {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    };
  }

  createPrimitiveState() {
    return {
      topology: "triangle-list",
      cullMode: "back",
      frontFace: "ccw",
    };
  }

  createDepthStencilState() {
    return {
      format: this.context.constructor.DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: "less",
    };
  }
}
