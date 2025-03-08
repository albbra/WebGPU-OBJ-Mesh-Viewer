export class InputHandler {
  constructor(canvas) {
    // Rotation state
    this.rotXAngle = 0; // X-axis rotation
    this.rotYAngle = 0; // Y-axis rotation
    this.cameraZ = 0; // Camera distance
    this.modelRadius = 0;

    // Mouse drag state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Initialize event listeners
    this.initControls(canvas);
  }

  // Set up input event handlers
  initControls(canvas) {
    canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    window.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  handleMouseDown(e) {
    this.isDragging = true;
    [this.lastMouseX, this.lastMouseY] = [e.clientX, e.clientY];
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;

    this.rotYAngle += dx * 0.01;
    this.rotXAngle += dy * 0.01;

    [this.lastMouseX, this.lastMouseY] = [e.clientX, e.clientY];
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleKeyPress(e) {
    if (!this.modelRadius) return;

    const step = this.modelRadius * 0.2;
    const minZ = this.modelRadius * 0.5;
    const maxZ = this.modelRadius * 10;

    if (e.key === "w") this.cameraZ = Math.max(minZ, this.cameraZ - step);
    if (e.key === "s") this.cameraZ = Math.min(maxZ, this.cameraZ + step);
  }
}
