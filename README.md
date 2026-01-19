# 3D Real Estate Management System
## UC 007: Generate 3D Layout & UC 003: Annotate 3D Layout

A TypeScript and Three.js powered system that automates the transition from 2D architectural drafting to 3D interactive environments, featuring a robust spatial annotation system.

## 🌟 Use Case Overview

This project implements two core functionalities:
1.  **UC 007 - Generate 3D Layout from 2D Plan:** Processes 2D DXF files, validates CAD data, and reconstructs geometry into a textured 3D model.
2.  **UC 003 - Annotate 3D Layout:** Allows users to place spatial markers and text labels within the generated 3D environment for room labeling and asset management.
   
## 🏗️ Design Pattern: Iterator

To manage the complex hierarchy of generated architectural elements and their associated annotations, this project utilizes the **Iterator Design Pattern**. This allows for uniform traversal of the scene without exposing the internal collection structures.

- **`LayoutIterator`**: Iterates through multiple layout versions or structural segments.
- **`RoomIterator`**: Specifically traverses individual room objects within a layout to manage local properties.
- **`AnnotationIterator`**: Facilitates the batch rendering, updating, and validation of all user-placed annotations in the 3D space.
- **`CompositeIterator`**: Used for deep traversal of nested objects (e.g., finding specific furniture/annotations within a room).

## 🚀 Key Features

- **Automated Reconstruction:** Converts DXF lines and polylines into 3D wall meshes and floor planes.
- **Data Validation:** System-level checks for CAD format consistency and readability before generation.
- **Smart Scaling:** Auto-calculates model bounds to center the camera and scale the layout perfectly.
- **Interactive Annotation Tool:** Place markers directly on 3D surfaces with custom text data.
- **Glassmorphism UI:** A modern, semi-transparent interface for file handling and system feedback.

## 📦 Getting Started

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🖥️ Usage

1. Open the application in your browser.
2. Click on the "Choose File" input and select a .dxf floor plan.
3. Click the Generate 3D Layout button.
4. Use your mouse to navigate the generated 3D environment (Left-click to rotate, scroll to zoom, right-click to pan). 

## 🔧 Technologies Used

- TypeScript: For type-safe application logic.
- Three.js: For high-performance 3D rendering.
- dxf-parser: For extracting geometric data from CAD files.
- Vite: As the modern frontend build tool.



---
*This project serves as a practical implementation of software design patterns in 3D web applications.*
