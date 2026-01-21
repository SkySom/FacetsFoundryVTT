import type {ActorRollData} from "../../interfaces/roll.interface";

export class FacetsRoll extends Roll<ActorRollData> {
    constructor(formula: string, data?: ActorRollData, options?: Roll.Options) {
        super(formula, data, options);

        console.log("Facets | " + this.terms.join(","))
    }
}