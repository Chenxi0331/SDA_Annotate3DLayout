// 1. Correct the imports. Use 'import * as THREE' to access Vector3 and Object3D.
import * as THREE from 'three';
import { AnnotationService } from '../services/AnnotationService';
import { Validator, Parser } from './DataProcessing';
import { ReconstructionEngine } from './ReconstructionEngine';
import { Database, I2DToolsFactory } from '../utils/ArchitectureSupport';
import { BackgroundProcessor } from './BackgroundProcessor';

export class GenerationFacade {
    private validator: Validator;
    private parser: Parser;
    private reconstructionEngine: ReconstructionEngine;
    private database: Database;
    private i2dToolsFactory: I2DToolsFactory;
    private annotationService: AnnotationService;
    private backgroundProcessor?: BackgroundProcessor;

    constructor(
        validator: Validator,
        parser: Parser,
        reconstructionEngine: ReconstructionEngine,
        database: Database,
        i2dToolsFactory: I2DToolsFactory,
        annotationService: AnnotationService
    ) {
        this.validator = validator;
        this.parser = parser;
        this.reconstructionEngine = reconstructionEngine;
        this.database = database;
        this.i2dToolsFactory = i2dToolsFactory;
        this.annotationService = annotationService;
    }

    public setBackgroundProcessor(processor: BackgroundProcessor) {
        this.backgroundProcessor = processor;
    }

    async generate3DLayoutFrom2D(planID: string): Promise<{ id: string, layout: any }> {
        console.log(`[GenerationFacade] Initiating generation for Plan: ${planID.substring(0, 20)}...`);

        const tools = this.i2dToolsFactory.createTools(planID);
        console.log(`Tools initialized: ${tools.length}`);

        const isValid = this.validator.validate(planID);
        if (!isValid) throw new Error("Plan validation failed.");

        const geometricModel = this.parser.parse(planID);
        const layout3D = this.reconstructionEngine.reconstruct(geometricModel);
        const layoutID = this.database.store(layout3D);

        return { id: layoutID, layout: layout3D };
    }

    async enqueueGeneration(content: string): Promise<string> {
        if (!this.backgroundProcessor) {
            throw new Error("BackgroundProcessor not initialized in Facade.");
        }
        return this.backgroundProcessor.enqueueTask(content);
    }

    addAnnotation(text: string, position: THREE.Vector3) {
        return this.annotationService.addAnnotation(text, position);
    }

    removeAnnotation(id: string) {
        this.annotationService.removeAnnotation(id);
    }
}
