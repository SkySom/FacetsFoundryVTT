import {ActorFacets} from "@actor";
import {ItemFacets} from "@item";

declare global {
    interface CONFIG {

    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets;
        Item: typeof ItemFacets;
    }
}