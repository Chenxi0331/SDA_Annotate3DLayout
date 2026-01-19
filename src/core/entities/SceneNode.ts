import * as THREE from 'three';
import { IIterator, IAggregate } from '../Iterator';

export abstract class SceneNode implements IAggregate<SceneNode> {
    public id: string;
    public name: string;
    public children: SceneNode[] = [];
    public object3D: THREE.Object3D | null = null; // The visual representation

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    add(node: SceneNode): void {
        this.children.push(node);
    }

    remove(node: SceneNode): void {
        const index = this.children.indexOf(node);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    abstract createIterator(): IIterator<SceneNode>;
}
