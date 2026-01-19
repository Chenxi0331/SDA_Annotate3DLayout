import { IIterator } from '../Iterator';
import { SceneNode } from '../entities/SceneNode';

export class CompositeIterator implements IIterator<SceneNode> {
    private children: SceneNode[];
    private position: number = 0;

    constructor(children: SceneNode[]) {
        this.children = children;
    }

    hasNext(): boolean {
        return this.position < this.children.length;
    }

    next(): SceneNode | null {
        if (this.hasNext()) {
            return this.children[this.position++];
        }
        return null;
    }
}
