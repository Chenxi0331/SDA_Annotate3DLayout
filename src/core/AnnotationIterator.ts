import { IIterator } from './Iterator';
import { AnnotationData } from '../services/AnnotationService';

export class AnnotationIterator implements IIterator<AnnotationData> {
    private collection: AnnotationData[];
    private position: number = 0;

    constructor(collection: AnnotationData[]) {
        this.collection = collection;
    }

    hasNext(): boolean {
        return this.position < this.collection.length;
    }

    next(): AnnotationData | null {
        if (this.hasNext()) {
            return this.collection[this.position++];
        }
        return null;
    }
}
