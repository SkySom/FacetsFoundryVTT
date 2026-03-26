import type { AnyObject } from "fvtt-types/utils";
import type { FacetsRollData } from "../roll/facets_roll_data";

import { isRollableData } from "./data/interfaces";

export class ActorFacets<Subtype extends Actor.SubType = Actor.SubType> extends Actor<Subtype> {
    override prepareData(): void {
        console.log("Facets | Actor Prepare Data");
    }

    override getRollData(): AnyObject {
        return super.getRollData();
    }

    getFacetsRollData(): FacetsRollData<string> {
        if (isRollableData(this.system)) {
            return this.system.getFacetsRollData()
        } else {
            return {};
        }
    }
}
