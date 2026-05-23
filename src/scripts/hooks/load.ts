import { ActorFacets } from "@actor";
import { FacetsChatMessage } from "@documents/chat/chat_message";
import { FacetsCombat } from "@documents/combat/combat";
import { FacetsCombatant } from "@documents/combat/combatant";
import { Logger } from "../../module/util/logger";
import type { Listener } from "./hooks.interface";

export class Load implements Listener {
    listen(): void {
        Logger.info("Running Load");

        CONFIG.Actor.documentClass = ActorFacets;
        CONFIG.Combat.documentClass = FacetsCombat;
        CONFIG.Combatant.documentClass = FacetsCombatant;
        CONFIG.ChatMessage.documentClass = FacetsChatMessage;
    }
}
