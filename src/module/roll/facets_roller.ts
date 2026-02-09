import { FacetsRollResults } from "./facets_roll_result";
import type { RollOptions } from "./roll_options";
import type { RollToken } from "./token/roll_token";
import type { RollValue } from "./value/roll_value";

export class FacetsRoller {
    evaluated: boolean = false;

    constructor(readonly rollValues: Array<RollValue>) {}

    async evaluate(): Promise<void> {
        if (this.evaluated) {
            return Promise.resolve();
        } else {
            this.evaluated = true;
            return Promise.all(this.rollValues.map((rollValue) => rollValue.evaluate())).then();
        }
    }

    async getResults(rollOptions: RollOptions): Promise<FacetsRollResults> {
        await this.evaluate();

        return FacetsRollResults.fromRollValues(this.rollValues, rollOptions);
    }

    static fromTokens(rollTokens: Array<RollToken>): FacetsRoller {
        return new FacetsRoller(rollTokens.flatMap((rollToken) => rollToken.provide()));
    }
}
