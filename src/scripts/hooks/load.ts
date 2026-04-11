import { ActorFacets } from "@actor";
import type { Listener } from "./hooks.interface";
import { FacetsChatMessage } from "@documents/chat/chat_message";
import { Logger } from "../../module/util/logger";
import { FacetsCombat } from "@documents/combat/combat";
import { FacetsCombatant } from "@documents/combat/combatant";

export class Load implements Listener {
    listen(): void {
        Logger.info("Running Load");

        CONFIG.Actor.documentClass = ActorFacets;
        CONFIG.Combat.documentClass = FacetsCombat;
        CONFIG.Combatant.documentClass = FacetsCombatant;
        CONFIG.ChatMessage.documentClass = FacetsChatMessage;
    }
}
