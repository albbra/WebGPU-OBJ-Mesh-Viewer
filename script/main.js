import { WebGPUContext } from "./webgpu-context.js";
import { InputHandler } from "./input-handler.js";
import { TransformController } from "./transform-controller.js";
import { RenderLoop } from "./render-loop.js";
import { ShaderLoader } from "./shader-loader.js";
import { OBJLoader } from "./obj-loader.js";

async function initWebGPU() {
  const MODEL_PATH = "../models/stanford_dragon_vrip/dragon.obj";

  try {
    // Canvas setup
    const canvas = document.getElementById("webgpuCanvas");
    function updateCanvasSize() {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    }
    updateCanvasSize();

    // Initialize core systems
    const webGPU = new WebGPUContext(canvas);
    const input = new InputHandler(canvas);
    await webGPU.initialize();

    // Load OBJ model
    const model = await OBJLoader.loadModel(webGPU.device, MODEL_PATH);
    webGPU.createBuffers(model);
    input.modelRadius = model.radius;
    input.cameraZ = model.radius / Math.tan(Math.PI/8) * 1.2;

    // Load shaders
    const shaderModule = await ShaderLoader.load(webGPU.device);
    await webGPU.createPipeline(shaderModule);

    // Initialize remaining systems
    const transforms = new TransformController(input, webGPU);
    const renderer = new RenderLoop(webGPU, transforms);

    // Handle window resize
    const onResize = () => {
      updateCanvasSize();
      webGPU.resize();
    };
    window.addEventListener("resize", onResize);

    // Start rendering
    renderer.start();
  } catch (error) {
    console.error("Fatal initialization error:", error);
  }
}

// Start application
initWebGPU();
