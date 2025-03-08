import { ShaderLoader } from "./shader-loader.js";
import { OBJLoader } from "./obj-loader.js";

export class AssetLoader {
  static async loadModel(device, url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Model load failed: ${url}`);
    return OBJLoader.loadModel(device, url);
  }

  static async loadShader(device) {
    try {
      return await ShaderLoader.load(device);
    } catch (error) {
      throw new Error(`Shader load failed: ${error.message}`);
    }
  }

  static async loadAll(device, modelPath) {
    const [model, shader] = await Promise.all([
      this.loadModel(device, modelPath),
      this.loadShader(device),
    ]);

    return { model, shader };
  }
}
