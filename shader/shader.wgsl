struct Uniforms {
  mvp : mat4x4<f32>,
  model : mat4x4<f32>,
  cameraPos : vec4<f32>,
  lightPos : vec4<f32>,
  ambientColor : vec4<f32>,
  diffuseColor : vec4<f32>,
  specularColor : vec4<f32>,
  specularPower : vec4<f32>,
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
    let N = normalize(input.normal);
    let L = normalize(uniforms.lightPos.xyz - input.worldPos);
    let V = normalize(uniforms.cameraPos.xyz - input.worldPos);
    let R = reflect(-L, N);
    
    let ambient = uniforms.ambientColor.xyz;
    let diffuse = max(dot(N, L), 0.0) * uniforms.diffuseColor.xyz;
    let specular = pow(max(dot(V, R), 0.0), uniforms.specularPower.x) * uniforms.specularColor.xyz;
    
    let finalColor = ambient + diffuse + specular;
    return vec4<f32>(finalColor, 1.0);
}