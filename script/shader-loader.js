// Shader module loader
export class ShaderLoader {
  // Load and compile WGSL shader
  static async load(device) {
    // Fetch shader source
    const response = await fetch("../shader/shader.wgsl");
    if (!response.ok) throw new Error(`Shader load failed: ${response.status}`);
    const code = await response.text();

    // Create shader module
    const shaderModule = device.createShaderModule({
      code: code,
      label: "Main Shader Module",
    });

    // Verify compilation
    return new Promise((resolve) => {
      shaderModule.getCompilationInfo().then((info) => {
        if (info.messages.length > 0) {
          console.error("Shader errors:", info.messages);
        }
        resolve(shaderModule);
      });
    });
  }
}
