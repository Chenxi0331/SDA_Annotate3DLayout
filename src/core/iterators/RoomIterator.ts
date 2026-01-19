import { CompositeIterator } from './CompositeIterator';
import { SceneNode } from '../entities/SceneNode';

export class RoomIterator extends CompositeIterator {
    constructor(furniture: SceneNode[]) {
        super(furniture);
    }
}
