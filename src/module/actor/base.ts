import type { FacetsRollData } from "../roll/facets_roll_data";
import { FacetsBaseActorData } from "./data/base";

export class ActorFacets<Subtype extends Actor.SubType = Actor.SubType> extends Actor<Subtype> {
    constructor(data: Actor.CreateData, ctx?: foundry.abstract.Document.ConstructionContext<TokenDocument>) {
        super(data, ctx);
    }

    getFacetsRollData(): FacetsRollData<string> {
        if (this.system instanceof FacetsBaseActorData) {
            return this.system.getFacetsRollData();
        }
        return {};
    }
}
