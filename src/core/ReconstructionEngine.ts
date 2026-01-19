import * as THREE from 'three';
import { IIterator } from './Iterator';
import { Layout3D } from './entities/Layout3D';
import { Room } from './entities/Room';
import { Furniture } from './entities/Furniture';
import { AnnotationData } from '../services/AnnotationService';

export class ReconstructionEngine {
    private wallHeight: number = 2.5;
    private wallColor: number = 0xcccccc;

    /**
     * Reconstructs 3D layout from a DXF model
     */
    reconstruct(dxfModel: any): Layout3D {
        console.log("[ReconstructionEngine] Reconstructing 3D layout from DXF...");

        const layout = new Layout3D("layout-1", "Main Layout");
        const defaultRoom = new Room("room-1", "Default Room");
        layout.add(defaultRoom);

        // Group for visual representation
        const layoutGroup = new THREE.Group();
        layout.object3D = layoutGroup;

        if (!dxfModel || !dxfModel.entities) return layout;

        // 1. Calculate Bounding Box and Scale (Existing logic)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const updateBounds = (v: any) => {
            if (v.x < minX) minX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.x > maxX) maxX = v.x;
            if (v.y > maxY) maxY = v.y;
        };
        dxfModel.entities.forEach((entity: any) => {
            if (entity.vertices) entity.vertices.forEach(updateBounds);
        });
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const maxDimension = Math.max(width, height);
        const scale = maxDimension > 0 ? 20 / maxDimension : 1;

        // 2. Floor
        const floorGeometry = new THREE.PlaneGeometry(width * scale * 1.2, height * scale * 1.2);
        const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        layoutGroup.add(floor); // Add floor directly to layout group as it's global

        // 3. Walls
        const offsetAndScale = (x: number, y: number) => ({
            x: (x - centerX) * scale,
            y: (y - centerY) * scale
        });

        dxfModel.entities.forEach((entity: any) => {
            const layer = entity.layer || '0';
            if (entity.type === 'LINE') {
                const v1 = offsetAndScale(entity.vertices[0].x, entity.vertices[0].y);
                const v2 = offsetAndScale(entity.vertices[1].x, entity.vertices[1].y);
                this.addWallToRoom(defaultRoom, v1.x, v1.y, v2.x, v2.y, layoutGroup, layer);
            } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
                for (let i = 0; i < entity.vertices.length - 1; i++) {
                    const v1 = offsetAndScale(entity.vertices[i].x, entity.vertices[i].y);
                    const v2 = offsetAndScale(entity.vertices[i + 1].x, entity.vertices[i + 1].y);
                    this.addWallToRoom(defaultRoom, v1.x, v1.y, v2.x, v2.y, layoutGroup, layer);
                }
                if (entity.shape) {
                    const v1 = offsetAndScale(entity.vertices[entity.vertices.length - 1].x, entity.vertices[entity.vertices.length - 1].y);
                    const v2 = offsetAndScale(entity.vertices[0].x, entity.vertices[0].y);
                    this.addWallToRoom(defaultRoom, v1.x, v1.y, v2.x, v2.y, layoutGroup, layer);
                }
            }
        });

        console.log("[ReconstructionEngine] Hierarchical 3D layout reconstruction complete.");
        return layout;
    }

    private addWallToRoom(room: Room, x1: number, y1: number, x2: number, y2: number, group: THREE.Group, layer: string) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < 0.001) return;

        // Determine height and color based on layer
        let height = this.wallHeight;
        let color = this.wallColor;

        if (layer === 'FURNITURE') {
            height = 0.7; // Standard desk/table height
            color = 0x8b4513; // Saddle Brown
        } else if (layer === 'DECOR') {
            height = 0.05; // Thin decorative element
            color = 0x4682b4; // Steel Blue
        } else if (layer === 'WALLS') {
            height = 2.5;
            color = 0xffffff; // Clean White
        }

        // Create 3D Mesh
        const geometry = new THREE.BoxGeometry(length, height, 0.2);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const wallMesh = new THREE.Mesh(geometry, material);
        wallMesh.position.set((x1 + x2) / 2, height / 2, -(y1 + y2) / 2);
        wallMesh.rotation.y = Math.atan2(-dy, dx);

        group.add(wallMesh);

        // Create Wall Entity
        const wallEntity = new Furniture(`item-${Math.random()}`, layer === 'WALLS' ? "Wall" : "Furniture");
        wallEntity.object3D = wallMesh;

        room.add(wallEntity);
    }

    reconstructFromAdjustedData(adjustedData: any): Layout3D {
        return this.reconstruct(adjustedData);
    }

    renderAnnotations(iterator: IIterator<AnnotationData>): THREE.Group {
        const group = new THREE.Group();

        while (iterator.hasNext()) {
            const anno = iterator.next();
            if (anno) {
                const markerGeo = new THREE.SphereGeometry(0.2);
                const markerMat = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
                const marker = new THREE.Mesh(markerGeo, markerMat);

                marker.position.copy(anno.position);
                marker.userData = { id: anno.id, text: anno.text, isAnnotation: true };
                group.add(marker);
            }
        }
        return group;
    }

}
