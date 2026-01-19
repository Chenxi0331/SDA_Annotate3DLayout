import { SceneNode } from './SceneNode';
import { IIterator } from '../Iterator';
import { RoomIterator } from '../iterators/RoomIterator';

export class Room extends SceneNode {
    constructor(id: string, name: string) {
        super(id, name);
    }

    createIterator(): IIterator<SceneNode> {
        return new RoomIterator(this.children);
    }
}
