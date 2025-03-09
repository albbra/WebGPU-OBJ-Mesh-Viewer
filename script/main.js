import { WebGPUContext } from "./webgpu-context.js";
import { AssetLoader } from "./asset-loader.js";
import { InputHandler } from "./input-handler.js";
import { TransformController } from "./transform-controller.js";
import { RenderLoop } from "./render-loop.js";

async function initApp() {
  const canvas = initCanvas();
  const webGPU = new WebGPUContext(canvas);
  const input = new InputHandler(canvas);

  const MODEL_PATH = "../models/stanford_dragon_vrip/dragon.obj";

  try {
    await webGPU.initialize();
    const { model, shader } = await AssetLoader.loadAll(
      webGPU.device,
      MODEL_PATH
    );

    webGPU.createModelBuffers(model);
    await webGPU.createRenderPipeline(shader);

    initCamera(input, model);
    startRendering(webGPU, input);
    initWindowHandlers(canvas, webGPU);
  } catch (error) {
    console.error("App initialization failed:", error);
  }
}

function initCanvas() {
  const canvas = document.getElementById("webgpuCanvas");
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  return canvas;
}

function initCamera(input, model) {
  input.modelRadius = model.radius;
  input.cameraZ = (model.radius / Math.tan(Math.PI / 8)) * 1.2;
}

function startRendering(webGPU, input) {
  const transforms = new TransformController(input, webGPU);
  new RenderLoop(webGPU, transforms).start();
}

function initWindowHandlers(canvas, webGPU) {
  window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    webGPU.resize();
  });
}

initApp();
