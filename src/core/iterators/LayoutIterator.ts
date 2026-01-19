import { CompositeIterator } from './CompositeIterator';
import { SceneNode } from '../entities/SceneNode';

export class LayoutIterator extends CompositeIterator {
    constructor(rooms: SceneNode[]) {
        super(rooms);
    }
}
