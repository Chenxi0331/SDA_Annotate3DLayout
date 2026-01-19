export class I2DToolsFactory {
    createTools(planID: string): any[] {
        console.log(`[I2DToolsFactory] Creating tools for plan: ${planID}`);
        return [];
    }
}

export class Database {
    private layouts: Map<string, any> = new Map();
    private annotations: any[] = []; // Store annotation objects

    store(layout: any): string {
        const id = "layout-" + Math.random().toString(36).substr(2, 9);
        console.log(`[Database] Storing 3D layout under ID: ${id}`);
        this.layouts.set(id, layout);
        return id;
    }

    getLayout(id: string): any {
        return this.layouts.get(id);
    }

    // New methods for the annotation iteration
    addAnnotation(data: any) { this.annotations.push(data); }
    getAnnotations() { return this.annotations; }
    deleteAnnotation(id: string) {
        this.annotations = this.annotations.filter(a => a.id !== id);
    }
}
