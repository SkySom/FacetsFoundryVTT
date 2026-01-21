import type {AnyObject} from "fvtt-types/utils";

export class FacetsActor extends Actor {

    override prepareData(): void {
        console.log("Facets | Actor Prepare Data")
    }

    override getRollData(): AnyObject {
        return super.getRollData();
    }
}