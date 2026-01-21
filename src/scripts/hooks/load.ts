import {FacetsActor} from "@actor";
import type { Listener } from "./hooks.interface";

export class Load implements Listener {
    listen(): void {
        console.log("Facets | Running Load")

        CONFIG.Actor.documentClass = FacetsActor;
    }
}