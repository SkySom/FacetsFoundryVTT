import type { AnyObject } from "fvtt-types/utils";
import type { FacetsRollData } from "../roll/facets_roll_data";

export class FacetsActor extends Actor {
    override prepareData(): void {
        console.log("Facets | Actor Prepare Data");
    }

    override getRollData(): AnyObject {
        return super.getRollData();
    }

    getFacetsRollData(): FacetsRollData<string> {
        return {};
    }
}
