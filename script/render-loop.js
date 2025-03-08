
// Rendering loop manager
export class RenderLoop {
  constructor(webGPUContext, transformController) {
    this.webGPU = webGPUContext;
    this.transform = transformController;
    this.frameCount = 0;
  }

  // Start rendering loop
  start() {
    const frame = () => {
      this.frameCount++;
      try {
        // Update matrices and render
        this.transform.updateTransforms();
        this.executeRenderPass();
      } catch (error) {
        console.error("Render error:", error);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // Execute WebGPU render pass
  executeRenderPass() {
    // Create command encoder
    const commandEncoder = this.webGPU.device.createCommandEncoder();

    // Begin render pass with color/depth attachments
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.webGPU.canvas
            .getContext("webgpu")
            .getCurrentTexture()
            .createView(),
          clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: this.webGPU.depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    // Set rendering state
    renderPass.setPipeline(this.webGPU.pipeline);
    renderPass.setBindGroup(0, this.webGPU.bindGroup);
    renderPass.setVertexBuffer(0, this.webGPU.vertexBuffer);
    renderPass.setIndexBuffer(this.webGPU.indexBuffer, "uint32");

    // Draw indexed geometry
    renderPass.drawIndexed(this.webGPU.indexBuffer.size / Uint32Array.BYTES_PER_ELEMENT);

    // Submit commands
    renderPass.end();
    this.webGPU.device.queue.submit([commandEncoder.finish()]);
  }
}
