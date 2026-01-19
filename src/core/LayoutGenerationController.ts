import { GenerationFacade } from './GenerationFacade';

export class LayoutGenerationController {
    private facade: GenerationFacade;

    constructor(facade: GenerationFacade) {
        this.facade = facade;
    }

    async onGenerateButtonClicked(content: string): Promise<void> {
        console.log("[LayoutGenerationController] Requesting generation via Facade.");
        try {

            const jobId = await this.facade.enqueueGeneration(content);
            console.log(`[LayoutGenerationController] Job queued: ${jobId}`);
        } catch (error) {
            console.error("[LayoutGenerationController] Failed to start generation:", error);
        }
    }


    async regenerateButtonClick(): Promise<void> {
        console.log("[LayoutGenerationController] Regenerate button clicked.");

    }
}
