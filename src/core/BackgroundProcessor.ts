import { GenerationFacade } from './GenerationFacade';

export enum JobStatus {
    IDLE = 'IDLE',
    QUEUED = 'QUEUED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface Job {
    id: string;
    planID: string;
    status: JobStatus;
    progress: number;
    error?: string;
    resultID?: string;
    result?: any;
}

export class BackgroundProcessor {
    private facade: GenerationFacade;
    private jobs: Map<string, Job> = new Map();
    private currentJobId: string | null = null;

    public onStatusChange: (job: Job) => void = () => { };

    constructor(facade: GenerationFacade) {
        this.facade = facade;
    }

    public async enqueueTask(planID: string): Promise<string> {
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const newJob: Job = {
            id: jobId,
            planID: planID,
            status: JobStatus.QUEUED,
            progress: 0
        };

        this.jobs.set(jobId, newJob);
        this.notify(newJob);

        if (!this.currentJobId) {
            this.processNext();
        }

        return jobId;
    }

    private async processNext() {
        const nextJobEntry = Array.from(this.jobs.values()).find(j => j.status === JobStatus.QUEUED);

        if (!nextJobEntry) {
            this.currentJobId = null;
            return;
        }

        this.currentJobId = nextJobEntry.id;
        await this.executeJob(nextJobEntry);

        this.processNext();
    }

    private async executeJob(job: Job) {
        console.log(`[BackgroundProcessor] Starting Job: ${job.id} for Plan: ${job.planID.substring(0, 20)}...`);

        try {
            this.updateJob(job.id, { status: JobStatus.PROCESSING, progress: 10 });
            await this.yieldToUI(); 

            this.updateJob(job.id, { progress: 30 }); 
            await this.yieldToUI(); 

            const { id: resultID, layout } = await this.facade.generate3DLayoutFrom2D(job.planID);

            await this.yieldToUI(); 

            this.updateJob(job.id, {
                status: JobStatus.COMPLETED,
                progress: 100,
                resultID: resultID,
                result: layout
            });

            console.log(`[BackgroundProcessor] Job ${job.id} finished successfully.`);

        } catch (err: any) {
            console.error(`[BackgroundProcessor] Job ${job.id} failed:`, err);
            this.updateJob(job.id, {
                status: JobStatus.FAILED,
                error: err.message || 'Unknown error'
            });
        }
    }

    private yieldToUI(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 50));
    }

    private updateJob(jobId: string, updates: Partial<Job>) {
        const job = this.jobs.get(jobId);
        if (job) {
            const updatedJob = { ...job, ...updates };
            this.jobs.set(jobId, updatedJob);
            this.notify(updatedJob);
        }
    }

    private notify(job: Job) {
        if (this.onStatusChange) {
            this.onStatusChange(job);
        }
    }

    public getJobStatus(jobId: string): Job | undefined {
        return this.jobs.get(jobId);
    }

    public getAllJobs(): Job[] {
        return Array.from(this.jobs.values());
    }
}
