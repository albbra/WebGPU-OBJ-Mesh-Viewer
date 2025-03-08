export class BufferManager {
    constructor(context) {
      this.context = context;
    }
  
    createVertexBuffer() {
      if (!this.context.modelData?.vertexData) {
        throw new Error('Vertex buffer creation failed: No vertex data available');
      }
      
      this.context.vertexBuffer = this.context.device.createBuffer({
        size: this.context.modelData.vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      
      new Float32Array(this.context.vertexBuffer.getMappedRange())
        .set(this.context.modelData.vertexData);
      this.context.vertexBuffer.unmap();
    }
  
    createIndexBuffer() {
      if (!this.context.modelData?.indexData) {
        throw new Error('Index buffer creation failed: No index data available');
      }
      
      this.context.indexBuffer = this.context.device.createBuffer({
        size: this.context.modelData.indexData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      
      new Uint32Array(this.context.indexBuffer.getMappedRange())
        .set(this.context.modelData.indexData);
      this.context.indexBuffer.unmap();
    }
  
    createUniformBuffer() {
      this.context.uniformBuffer = this.context.device.createBuffer({
        size: 160, // Space for MVP + model matrices + camera/light positions
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
    }
  }
  