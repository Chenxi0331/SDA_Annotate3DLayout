// RESET CAMERA BUTTON - Click to exit zoom
const resetCameraBtn = document.getElementById('reset-camera-btn') as HTMLButtonElement;
resetCameraBtn.addEventListener('click', () => {
    resetCamera();
});

// KEYBOARD SHORTCUT - Press ESC to reset camera
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        resetCamera();
    }
});// ... imports
import * as THREE from 'three';
import { ThreeViewer } from './ui/ThreeViewer';
import { LayoutGenerationController } from './core/LayoutGenerationController';
import { BackgroundProcessor, JobStatus } from './core/BackgroundProcessor';
import { GenerationFacade } from './core/GenerationFacade';
import { Validator, Parser } from './core/DataProcessing';
import { ReconstructionEngine } from './core/ReconstructionEngine';
import { Database, I2DToolsFactory } from './utils/ArchitectureSupport';
import { AnnotationService } from './services/AnnotationService';
import { AnnotationIterator } from './core/AnnotationIterator'; // Import Iterator
// 1. Initialize Components
const viewer = new ThreeViewer('three-container');
const validator = new Validator();
const parser = new Parser();
const reconstructionEngine = new ReconstructionEngine();
const database = new Database();
const i2dToolsFactory = new I2DToolsFactory();
const annotationService = new AnnotationService();

const generationFacade = new GenerationFacade(
    validator, parser, reconstructionEngine, database,
    i2dToolsFactory, annotationService
);

const backgroundProcessor = new BackgroundProcessor(generationFacade);
generationFacade.setBackgroundProcessor(backgroundProcessor);

const controller = new LayoutGenerationController(generationFacade);

// --- Background Processor UI Link ---
backgroundProcessor.onStatusChange = (job) => {
    statusEl.innerText = `Status: ${job.status} (${job.progress}%)`;

    if (job.status === JobStatus.COMPLETED && job.resultID && job.result) {
        statusEl.innerText = "3D Layout Generated Successfully!";

        const layout3D = job.result;
        viewer.clearScene();

        if (layout3D.object3D) {
            viewer.addToScene(layout3D.object3D);
            // @ts-ignore - access to private or local var if needed, but lastModel3D is accessible in this scope
            lastModel3D = layout3D.object3D;
            viewer.centerCameraOn(layout3D.object3D);
        }

        // Re-render annotations
        const iterator = annotationService.createIterator();
        if (iterator.hasNext()) {
            const markers = reconstructionEngine.renderAnnotations(annotationService.createIterator());
            viewer.addToScene(markers);
        }

        renderSidebar();
    }

    if (job.status === JobStatus.FAILED) {
        statusEl.innerText = `Error: ${job.error}`;
    }
};

// 2. UI Elements
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLElement;
const floorPlanInput = document.getElementById('floorPlanInput') as HTMLInputElement;
const threeContainer = document.getElementById('three-container') as HTMLElement;

// Modal Elements
const modal = document.getElementById('annotation-modal') as HTMLElement;
const editText = document.getElementById('edit-text') as HTMLTextAreaElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const deleteBtn = document.getElementById('delete-btn') as HTMLButtonElement;
const closeBtn = document.getElementById('close-btn') as HTMLButtonElement;

// Sidebar Element
const sidebarList = document.getElementById('annotation-list') as HTMLUListElement;

let currentSelectedId: string | null = null;
let currentSelectedMesh: THREE.Object3D | null = null;

/**
 * SIDEBAR RENDERER
 * Keeps the UI list in sync with the AnnotationService
 */
function renderSidebar() {
    if (!sidebarList) return;
    sidebarList.innerHTML = ''; // Clear current list

    // USE ITERATOR
    const iterator = annotationService.createIterator();
    while (iterator.hasNext()) {
        const anno = iterator.next();
        if (anno) {
            const li = document.createElement('li');
            li.className = 'sidebar-item';
            li.innerHTML = `<span>${anno.text}</span>`;

            // Clicking sidebar item centers camera on the annotation
            li.onclick = () => {
                const tempObj = new THREE.Object3D();
                tempObj.position.copy(anno.position);
                viewer.centerCameraOn(tempObj);
            };

            sidebarList.appendChild(li);
        }
    }
}

/**
 * RESET CAMERA TO FULL VIEW
 */
let lastModel3D: THREE.Object3D | null = null;

function resetCamera() {
    if (lastModel3D) {
        viewer.centerCameraOn(lastModel3D);
    }
}

/**
 * CREATE/EDIT ANNOTATION FLOW
 */
function openAnnotationModal(id: string | null, text: string) {
    currentSelectedId = id;
    editText.value = text;
    modal.classList.remove('hidden');
}

// 3. Interaction Logic - SINGLE CLICK to CREATE or EDIT
threeContainer.addEventListener('click', (e) => {
    const hit = viewer.getClickPosition(e);

    if (hit) {
        if (hit.object.userData.isAnnotation) {
            // EDIT MODE - Click existing annotation
            currentSelectedMesh = hit.object;
            const id = hit.object.userData.id;
            const text = hit.object.userData.text || "";
            openAnnotationModal(id, text);
        } else {
            // CREATE MODE - Click empty space
            const text = prompt("Enter annotation text:");
            if (text && text.trim() !== "") {
                const data = annotationService.addAnnotation(text, hit.point);

                // Wrap single item in iterator for ReconstructionEngine
                const singleIterator = new AnnotationIterator([data]);
                const marker = reconstructionEngine.renderAnnotations(singleIterator);

                viewer.addToScene(marker);
                renderSidebar(); // Update Sidebar
            }
        }
    }
});

// --- SAVE Logic ---
saveBtn.addEventListener('click', () => {
    if (currentSelectedId && currentSelectedMesh) {
        const newText = editText.value;
        annotationService.updateAnnotation(currentSelectedId, newText);
        currentSelectedMesh.userData.text = newText; // Sync View

        // Update the 3D marker's text display if it has one
        if (currentSelectedMesh.children.length > 0) {
            const textMesh = currentSelectedMesh.children[0];
            if (textMesh instanceof THREE.Mesh) {
                textMesh.userData.text = newText;
            }
        }

        renderSidebar(); // Update Sidebar
        modal.classList.add('hidden');
        currentSelectedId = null;
        currentSelectedMesh = null;
    }
});

// --- DELETE Logic ---
deleteBtn.addEventListener('click', () => {
    if (currentSelectedId && currentSelectedMesh) {
        annotationService.removeAnnotation(currentSelectedId);
        viewer.removeFromScene(currentSelectedMesh);

        renderSidebar(); // Update Sidebar
        modal.classList.add('hidden');
        currentSelectedId = null;
        currentSelectedMesh = null;
    }
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    currentSelectedId = null;
    currentSelectedMesh = null;
});

// KEYBOARD SHORTCUT - Press ESC to reset camera
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        resetCamera();
    }
});

// 4. Generation Logic (Persistence)
generateBtn.addEventListener('click', async () => {
    const file = floorPlanInput.files?.[0];
    if (!file) {
        statusEl.innerText = "Please select a DXF file.";
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            // Pass the actual content to the controller
            statusEl.innerText = "Queueing for Background Processing...";
            controller.onGenerateButtonClicked(content);

            // Note: The actual rendering will be handled via the onStatusChange callback 
            // or by the existing facade logic if it's already wired to the viewer.
        } catch (error) {
            console.error(error);
            statusEl.innerText = "Error queueing processing job.";
        }
    };
    reader.readAsText(file);
});
