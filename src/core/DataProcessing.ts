import DxfParser from 'dxf-parser';

export class Parser {
    private parser: DxfParser;

    constructor() {
        this.parser = new DxfParser();
    }

    parse(dxfContent: string): any {
        console.log(`[Parser] Parsing DXF data...`);
        try {
            return this.parser.parseSync(dxfContent);
        } catch (err) {
            console.error('[Parser] Error parsing DXF:', err);
            throw err;
        }
    }
}

export class Validator {
    validate(planID: string): boolean {
        console.log(`[Validator] Validating plan: ${planID}`);
        return true; 
    }
}
