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

    // Light rotation parameters
    this.lightAzimuth = 45; // Horizontal angle (degrees)
    this.lightElevation = 30; // Vertical angle (degrees)
    this.lightDistance = 1.5; // Multiplier of model radius

    // Lighting properties
    this.ambientColor = [0.1, 0.1, 0.1];
    this.diffuseColor = [0.0, 0.0, 1.0];
    this.specularColor = [1.0, 1.0, 1.0];
    this.specularPower = 32.0;

    this.backgroundColor = [0.5, 0.5, 0.5];

    // Initialize event listeners
    this.initControls(canvas);
    this.initUIControls();
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

  initUIControls() {
    // Get DOM elements
    this.uiElements = {
      lightAzimuth: document.getElementById("lightAzimuth"),
      lightElevation: document.getElementById("lightElevation"),
      lightDistance: document.getElementById("lightDistance"),
      ambientColor: document.getElementById("ambientColor"),
      diffuseColor: document.getElementById("diffuseColor"),
      specularColor: document.getElementById("specularColor"),
      specularPower: document.getElementById("specularPower"),
      backgroundColor: document.getElementById("backgroundColor")
    };

    // Validate elements
    for (const [key, element] of Object.entries(this.uiElements)) {
      if (!element) throw new Error(`Missing UI element: ${key}`);
    }

    // Initialize values and listeners
    this.setupUIListeners();
    this.syncInitialValues();
  }

  setupUIListeners() {
    const updateUI = () => {
      this.lightAzimuth = parseFloat(this.uiElements.lightAzimuth.value);
      this.lightElevation = parseFloat(this.uiElements.lightElevation.value);
      this.lightDistance = parseFloat(this.uiElements.lightDistance.value);

      this.ambientColor = this.hexToVec3(this.uiElements.ambientColor.value);
      this.diffuseColor = this.hexToVec3(this.uiElements.diffuseColor.value);
      this.specularColor = this.hexToVec3(this.uiElements.specularColor.value);
      this.specularPower = parseFloat(this.uiElements.specularPower.value);
      this.backgroundColor = this.hexToVec3(this.uiElements.backgroundColor.value);
    };

    ["input", "change"].forEach(evt => {
      Object.values(this.uiElements).forEach(element => {
        element.addEventListener(evt, updateUI);
      });
    });

    updateUI();
  }

  syncInitialValues() {
    // Set UI from initial state
    this.uiElements.lightAzimuth.value = this.lightAzimuth;
    this.uiElements.lightElevation.value = this.lightElevation;
    this.uiElements.lightDistance.value = this.lightDistance;

    this.uiElements.ambientColor.value = this.vec3ToHex(this.ambientColor);
    this.uiElements.diffuseColor.value = this.vec3ToHex(this.diffuseColor);
    this.uiElements.specularColor.value = this.vec3ToHex(this.specularColor);
    this.uiElements.specularPower.value = this.specularPower;
    this.uiElements.backgroundColor.value = this.vec3ToHex(this.backgroundColor);
  }

  hexToVec3(hex) {
    return [
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    ];
  }

  vec3ToHex(colorArray) {
    const toHex = (c) => Math.round(c * 255).toString(16).padStart(2, "0");
    return `#${toHex(colorArray[0])}${toHex(colorArray[1])}${toHex(colorArray[2])}`;
  }
}

