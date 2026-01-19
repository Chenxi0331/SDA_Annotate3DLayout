import { SceneNode } from './SceneNode';
import { IIterator } from '../Iterator';
import { LayoutIterator } from '../iterators/LayoutIterator';

export class Layout3D extends SceneNode {
    constructor(id: string, name: string) {
        super(id, name);
    }

    createIterator(): IIterator<SceneNode> {
        return new LayoutIterator(this.children);
    }
}
