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
    initLightControls(input);
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

function initLightControls(input) {
  const hexToVec3 = (hex) => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];

  const updateLight = () => {
    input.lightAzimuth = parseFloat(
      document.getElementById("lightAzimuth").value
    );
    input.lightElevation = parseFloat(
      document.getElementById("lightElevation").value
    );
    input.lightDistance = parseFloat(
      document.getElementById("lightDistance").value
    );

    input.ambientColor = hexToVec3(
      document.getElementById("ambientColor").value
    );
    input.diffuseColor = hexToVec3(
      document.getElementById("diffuseColor").value
    );
    input.specularColor = hexToVec3(
      document.getElementById("specularColor").value
    );
    input.specularPower = parseFloat(
      document.getElementById("specularPower").value
    );

    input.backgroundColor = hexToVec3(
      document.getElementById("backgroundColor").value
    );
  };

  ["input", "change"].forEach((evt) => {
    document.getElementById("lightAzimuth").addEventListener(evt, updateLight);
    document
      .getElementById("lightElevation")
      .addEventListener(evt, updateLight);
    document.getElementById("lightDistance").addEventListener(evt, updateLight);

    document.getElementById("ambientColor").addEventListener(evt, updateLight);
    document.getElementById("diffuseColor").addEventListener(evt, updateLight);
    document.getElementById("specularColor").addEventListener(evt, updateLight);
    document.getElementById("specularPower").addEventListener(evt, updateLight);

    document
      .getElementById("backgroundColor")
      .addEventListener(evt, updateLight);
  });

  // Initialize values
  document.getElementById("lightAzimuth").value = 45;
  document.getElementById("lightElevation").value = 30;
  document.getElementById("lightDistance").value = 1.5;

  document.getElementById("ambientColor").value = "#191919";
  document.getElementById("diffuseColor").value = "#0000ff";
  document.getElementById("specularColor").value = "#ffffff";
  document.getElementById("specularPower").value = 32;

  document.getElementById("backgroundColor").value = "#808080";

  updateLight();
}

initApp();
