import * as THREE from 'three';
import { IAggregate, IIterator } from '../core/Iterator';
import { AnnotationIterator } from '../core/AnnotationIterator';

export interface AnnotationData {
    id: string;
    text: string;
    position: THREE.Vector3;
}

export class AnnotationService implements IAggregate<AnnotationData> {
    private annotations: AnnotationData[] = [];

    // Adds data to the array and returns it for rendering
    addAnnotation(text: string, position: THREE.Vector3): AnnotationData {
        const data: AnnotationData = {
            id: `anno-${Math.random().toString(36).substr(2, 9)}`,
            text: text,
            position: position.clone()
        };
        this.annotations.push(data);
        return data;
    }

    // Updates existing data (Fixes the "forgotten edit" bug)
    updateAnnotation(id: string, newText: string): void {
        const anno = this.annotations.find(a => a.id === id);
        if (anno) anno.text = newText;
    }

    // Removes data from the array
    removeAnnotation(id: string): void {
        this.annotations = this.annotations.filter(a => a.id !== id);
    }

    // IMPLEMENTS ITERATOR PATTERN
    createIterator(): IIterator<AnnotationData> {
        return new AnnotationIterator(this.annotations);
    }
}