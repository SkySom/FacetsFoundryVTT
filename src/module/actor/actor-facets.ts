import type {AnyObject} from "@league-of-foundry-developers/foundry-vtt-types/utils";

class ActorFacets extends Actor {

    override prepareData(): void {
        console.log("Facets | Actor Prepare Data")
    }

    override getRollData(): AnyObject {
        return super.getRollData();
    }
}

export {ActorFacets};