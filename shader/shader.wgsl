struct Uniforms {
  mvp : mat4x4<f32>,
  model : mat4x4<f32>,
  cameraPos : vec3<f32>,
  lightPos : vec3<f32>,
};

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

struct VertexInput {
  @location(0) position : vec3<f32>,
  @location(1) normal : vec3<f32>,
  @location(2) texcoord : vec2<f32>,
};


struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) worldPos : vec3<f32>,
  @location(1) normal : vec3<f32>,
};

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    let worldPos = (uniforms.model * vec4<f32>(input.position, 1.0)).xyz;
    output.position = uniforms.mvp * vec4<f32>(input.position, 1.0);
    output.worldPos = worldPos;
    output.normal = normalize((uniforms.model * vec4<f32>(input.normal, 0.0)).xyz);
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    let lightPos = uniforms.lightPos;
    let cameraPos = uniforms.cameraPos;
    
    // Normalize vectors
    let N = normalize(input.normal);
    let L = normalize(lightPos - input.worldPos);
    let V = normalize(cameraPos - input.worldPos);
    let R = reflect(-L, N);
    
    // Lighting calculations
    let ambient = vec3<f32>(0.1);
    let diffuse = max(dot(N, L), 0.0) * vec3<f32>(1.0, 0.0, 0.0);
    let specular = pow(max(dot(V, R), 0.0), 32.0) * vec3<f32>(1.0);
    
    let finalColor = ambient + diffuse + specular;
    return vec4<f32>(finalColor, 1.0);
}