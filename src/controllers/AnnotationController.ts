import { AnnotationService, AnnotationData } from '../services/AnnotationService';
import { ReconstructionEngine } from '../core/ReconstructionEngine';
import { IIterator } from '../core/Iterator';
import { Layout3D } from '../core/entities/Layout3D';
import { SceneNode } from '../core/entities/SceneNode';

export class AnnotationController {
    private currentLayout: Layout3D | null = null;
    private service: AnnotationService;
    private engine: ReconstructionEngine;

    constructor(service: AnnotationService, engine: ReconstructionEngine) {
        this.service = service;
        this.engine = engine;
    }

    setLayout(layout: Layout3D) {
        this.currentLayout = layout;
    }

    /**
     * Finds a node by ID using Hierarchical Iterator
     */
    findNodeById(id: string): SceneNode | null {
        if (!this.currentLayout) return null;

        // Level 1: Iterate Rooms
        const layoutIterator = this.currentLayout.createIterator();
        while (layoutIterator.hasNext()) {
            const room = layoutIterator.next();
            if (room) {
                if (room.id === id) return room;

                // Level 2: Iterate Furniture/Items within Room
                const roomIterator = room.createIterator();
                while (roomIterator.hasNext()) {
                    const item = roomIterator.next();
                    if (item && item.id === id) {
                        return item;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Synchronizes the sidebar UI with the current annotations using the Iterator.
     * This method does not know how annotations are stored internally.
     */
    syncSidebarUI(): void {
        console.log("Syncing Sidebar UI with Annotations...");
        const iterator = this.service.createIterator();
        const sidebarList = []; // Simulation of UI list

        while (iterator.hasNext()) {
            const annotation = iterator.next();
            if (annotation) {
                sidebarList.push({
                    id: annotation.id,
                    display: annotation.text
                });
                console.log(`Sidebar Item: [${annotation.text}]`);
            }
        }
    }

    /**
     * Refreshes the 3D markers in the scene using the Iterator.
     * Passes the iterator to the Engine, which handles the rendering loop.
     */
    refreshSceneMarkers(): void {
        console.log("Refreshing Scene Markers...");
        // Pass the iterator directly to the engine
        // The controller doesn't need to loop here if the engine does it, 
        // OR the controller gets the iterator and passes it. 
        // Requirement: "Modify renderAnnotations to accept an IIterator as its sole argument."
        const iterator = this.service.createIterator();
        const markerGroup = this.engine.renderAnnotations(iterator);

        // In a real app, we would add 'markerGroup' to the scene here
        console.log("Scene markers updated.", markerGroup);
    }

    /**
     * Example: Log the entire hierarchy structure using iterators
     */
    logHierarchy() {
        if (!this.currentLayout) return;

        console.log(`Layout: ${this.currentLayout.name}`);
        const layoutIterator = this.currentLayout.createIterator();

        while (layoutIterator.hasNext()) {
            const room = layoutIterator.next();
            if (room) {
                console.log(`  Room: ${room.name}`);
                const roomIterator = room.createIterator();

                while (roomIterator.hasNext()) {
                    const item = roomIterator.next();
                    if (item) {
                        console.log(`    Item: ${item.name} (${item.constructor.name})`);
                    }
                }
            }
        }
    }
}
