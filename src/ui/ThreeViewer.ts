import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export class ThreeViewer {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private container: HTMLElement;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) || document.body;

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 10, 10);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        // 5. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // 6. Helpers
        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);

        // 7. Base Plane
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2;
        plane.position.y = -0.01; // Slightly below grid
        this.scene.add(plane);

        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public addToScene(object: THREE.Object3D): void {
        this.scene.add(object);
    }

    public removeFromScene(object: THREE.Object3D): void {
        if (object.parent) {
            object.parent.remove(object);
        } else {
            this.scene.remove(object);
        }
    }

    public clearScene(): void {
        const objectsToRemove: THREE.Object3D[] = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.Group || (child instanceof THREE.Mesh && child.name !== 'base-floor')) {
                objectsToRemove.push(child);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));
    }

    public centerCameraOn(object: THREE.Object3D): void {
        const box = new THREE.Box3().setFromObject(object);

        let center = new THREE.Vector3();
        let size = new THREE.Vector3();

        // Handle case where object has no geometry (e.g. sidebar temporary objects)
        if (box.isEmpty()) {
            object.getWorldPosition(center);
            size.set(1, 1, 1); // Default size
        } else {
            box.getCenter(center);
            box.getSize(size);
        }

        const maxDim = Math.max(size.x, size.y, size.z, 2); // Ensure min dimension
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2)); // Adjusted divisor

        // Prevent cameraZ from being too small
        if (cameraZ < 2) cameraZ = 2;
        cameraZ *= 2.5; // Zoom out a bit

        this.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
        this.controls.target.copy(center);
        this.controls.update();
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getClickPosition(event: MouseEvent): { point: THREE.Vector3, object: THREE.Object3D } | null {
        const rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        return intersects.length > 0 ? { point: intersects[0].point, object: intersects[0].object } : null;
    }
}