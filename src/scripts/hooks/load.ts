import { ActorFacets } from "@actor";
import type { Listener } from "./hooks.interface";
import { FacetsChatMessage } from "@documents/chat/chat_message";
import { Logger } from "../../module/util/logger";

export class Load implements Listener {
    listen(): void {
        Logger.info("Running Load");

        CONFIG.Actor.documentClass = ActorFacets;
        CONFIG.ChatMessage.documentClass = FacetsChatMessage;
    }
}
