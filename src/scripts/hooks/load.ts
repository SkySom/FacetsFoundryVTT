import {FacetsActor} from "@actor";
import {FacetsItem} from "../../module/item";

export class Load {
    static listen(): void {
        CONFIG.Actor.documentClass = FacetsActor

        CONFIG.Item.documentClass = FacetsItem
    }
}