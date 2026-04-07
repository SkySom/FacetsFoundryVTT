export class RollResourceCost {
    constructor(
        readonly resource: string,
        readonly total: number
    ) {}

    withAdditional(additional: number): RollResourceCost {
        return new RollResourceCost(this.resource, this.total + additional);
    }
}

export class RollResourceResult {
    constructor(
        readonly resource: string,
        readonly total: number,
        readonly original: number,
        readonly current: number,
        readonly label: string,
        readonly text: string | undefined
    ) {}
}

export const doom = "doom";
export const plotPoints = "plotPoints";
