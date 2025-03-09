# WebGPU OBJ Mesh Viewer

This project demonstrates how to load and display 3D models using WebGPU. Features real-time manipulation of the Stanford Dragon model with interactive lighting controls and material properties adjustment.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Controls](#controls)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- Loads OBJ models with automatic normal calculation
- Real-time model manipulation:
  - Rotate with mouse drag
  - Zoom with W/S keys
- Interactive lighting controls:
  - Adjust light position (azimuth, elevation, distance)
  - Modify material properties (ambient/diffuse/specular colors)
  - Control specular highlight intensity
  - Change background color
- WebGPU-based rendering pipeline
- Adaptive resolution for window resizing

## Prerequisites

- **Microsoft Edge** (version 113+ recommended) or **Chrome** (version 113+) with WebGPU enabled
- **Visual Studio Code** with Live Server extension
- Basic understanding of 3D graphics concepts

## Setup

1. **Clone the repository**:
```bash
git clone https://github.com/albbra/WebGPU-OBJ-Mesh-Viewer.git
cd WebGPU-OBJ-Mesh-Viewer
```

### 2. Open the Project in VSCode

Open the project folder in Visual Studio Code:

```bash
code .
```

### 3. Install Live Server Extension

- Open the Extensions view in VSCode (**Ctrl+Shift+X**).
- Search for **Live Server** and install it.

## Running the Project

### 1. Start Live Server

- Open the `index.html` file in the project.
- Right-click anywhere in the file and select **Open with Live Server**.
- Alternatively, click the **Go Live** button in the bottom-right corner of VSCode.

### 2. Open in Microsoft Edge

Live Server will open the project in your default browser. If it doesn't open in Microsoft Edge, manually open Edge and navigate to:

```
http://127.0.0.1:5500
```

## Project Structure

The project is organized as follows:

```
WebGPU-Cube/
├── .vscode/
│   └── settings.json           # VSCode workspace settings
├── models/
│   └── stanford_dragon_vrip/
│       ├── dragon.obj          # Stanford Dragon model
│       └── license.txt         # Model usage terms
├── scripts/                    # JavaScript source files
│   ├── math/
│   │   ├── math4x4.js
│   │   └── vec3.js
│   ├── input-handler.js        # Mouse/keyboard input handling
│   ├── main.js                 # Application entry point
│   ├── obj-loader.js
│   ├── render-loop.js          # WebGPU rendering loop
│   ├── shader-loader.js        # WGSL shader loading
│   ├── transform-controller.js # Matrix transformations
│   ├── utils.js                # Helper functions
│   └── webgpu-context.js       # WebGPU initialization and management
├── shader/
│   └── shader.wgsl             # WebGPU shader code
├── style/
│   └── style.css               # CSS styles
├── index.html                  # Main HTML entry point
└── README.md                   # this Document
```

## Controls

### Model Manipulation

- **Mouse Drag:** Rotate model
- **W Key:** Zoom in
- **S Key:** Zoom out

### Lighting Controls

- **Azimuth:** Horizontal light angle (0-360°)
- **Elevation:** Vertical light angle (0-180°)
- **Distance:** Light distance from model (0.5x-3x model radius)

### Material Properties

- **Ambient:** Base color of unlit areas (color picker)
- **Diffuse:** Main surface color (color picker)
- **Specular:** Highlight color (color picker)
- **Specular Power:** Highlight sharpness (1-256 slider)

### Environment

- **Background Color:** Canvas background color (color picker)

## Troubleshooting

### 1. WebGPU Not Supported

If you see an error like *WebGPU is not supported in your browser*, ensure:

- You are using **Microsoft Edge** or another browser that supports WebGPU.
- WebGPU is enabled in your browser (usually enabled by default in Edge).

### 2. Model Not Rendering

If the model does not render:

- Check the browser console for errors (**F12 > Console**).

### 3. Live Server Issues

If Live Server does not work:

- Ensure the Live Server extension is installed and enabled.
- Restart VSCode and try again.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

### Model License

The **Stanford Dragon** model included in this project is licensed under **CC-BY-NC-4.0**, which means:

- **Non-commercial use only.**
- **Attribution required.**
- **Original model by 3D Graphics 101.**

#### **Credit Text (must be included in all distributions)**

This work is based on "Stanford Dragon (Vrip)" (https://sketchfab.com/3d-models/stanford-dragon-vrip-b602a35846e74533b1d9f06034a3b730) by 3D Graphics 101 (https://sketchfab.com/3dgraphics), licensed under CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/).

## Acknowledgments

Special thanks to:

- **[WebGPU Working Group](https://gpuweb.github.io/gpuweb/)** – For developing the WebGPU API.  
- **Microsoft Edge & Chrome Teams** – For implementing WebGPU support.  
- **Stanford University** – For providing the original **Stanford Dragon** scan data.  
- **[3D Graphics 101](https://sketchfab.com/3dgraphics)** – For processing and sharing the optimized version of the **Stanford Dragon** model on Sketchfab.  
