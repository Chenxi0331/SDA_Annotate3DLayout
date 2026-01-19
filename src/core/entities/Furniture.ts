import { SceneNode } from './SceneNode';
import { IIterator } from '../Iterator';
import { CompositeIterator } from '../iterators/CompositeIterator';

export class Furniture extends SceneNode {
    constructor(id: string, name: string) {
        super(id, name);
    }

    createIterator(): IIterator<SceneNode> {
        return new CompositeIterator(this.children);
    }
}
