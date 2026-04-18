import { FacetsBaseActorData } from "../data/actor/base";
import type { FacetsRollData, FacetsRollPool } from "../roll/facets_roll_data";

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

    getFacetsRollPools(): Record<string, FacetsRollPool> {
        if (this.system instanceof FacetsBaseActorData) {
            return this.system.getFacetsRollPools();
        }

        return {};
    }
}
