import {ActorFacets} from "@actor";

class Load {
    static listen(): void {
        console.log("Facets | Running Load")

        CONFIG.Actor.documentClass = ActorFacets;
    }
}

export {Load}