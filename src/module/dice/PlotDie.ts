import type { DeepPartial } from "fvtt-types/utils";

export default class PlotDie extends foundry.dice.terms.Die {
    static override DENOMINATION = "p";

    static get defaultTermData(): DeepPartial<foundry.dice.terms.Die.TermData> {
        return {
            number: 1,
            faces: 6,
            options: { flavor: game?.i18n?.localize("FACETS.Die.Plot") },
        };
    }

    override get denomination(): string {
        return "1pd" + this.faces;
    }

    override get formula(): string {
        return "1pd" + this.faces;
    }

    constructor(termData: TermData = {}) {
        termData = { ...PlotDie.defaultTermData, ...termData };

        super(termData);

        console.log("Facets | " + JSON.stringify(termData));
    }
}

type TermData = DeepPartial<foundry.dice.terms.Die.TermData>;

