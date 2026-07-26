import { ActorFacets } from "@actor";
import { ItemFacets } from "@item";

import type { PartyData } from "@data/actor/party";
import type { PlayerCharacterData } from "@data/actor/player_character";
import type { RollResultChatData } from "@data/chat/roll_result";
import type { FacetsChatMessage } from "@documents/chat/chat_message";
import type { Quench } from "@ethaks/fvtt-quench";
import type { BackgroundCharacterData } from "@data/actor/background_character";
import type { FacetsCombat } from "@documents/combat/combat";
import type { FacetsCombatant } from "@documents/combat/combatant";
import type { ForegroundCharacterData, SpotlightCharacterData } from "@data/actor";
import type { CompanionData } from "@data/actor/companion";
import type { ValueOf } from "fvtt-types/utils";
import type { DOOM_AND_PLOT_CONSTANTS } from "./module/settings/doom_and_plot_settings";

declare global {
    const socketlib: SocketLib;

    interface Game {
        facets: Facets;
        chatCommands: ChatCommands;
    }

    interface SettingConfig {
        "facets.recentRolls": string[];
        "facets.activeParty": string;
        "facets.createdFirstParty": foundry.data.fields.BooleanField;
        "facets.backgroundCharacterAutoSetup": foundry.data.fields.BooleanField<{ initial: true }>;
        "facets.DoomAndPlot": {
            location: ValueOf<typeof DOOM_AND_PLOT_CONSTANTS.LOCATION>;
            remoteToken: string;
            remoteUrl: string;
        };
    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets<Actor.SubType>;
        Combat: typeof FacetsCombat<Combat.SubType>;
        Combatant: typeof FacetsCombatant<Combatant.SubType>;
        ChatMessage: typeof FacetsChatMessage<ChatMessage.SubType>;
        Item: typeof ItemFacets;
    }

    interface DataModelConfig {
        Actor: {
            backgroundCharacter: typeof BackgroundCharacterData;
            companion: typeof CompanionData;
            foregroundCharacter: typeof ForegroundCharacterData;
            party: typeof PartyData;
            playerCharacter: typeof PlayerCharacterData;
            spotlightCharacter: typeof SpotlightCharacterData;
        };
        ChatMessage: {
            rollResult: typeof RollResultChatData;
        };
    }

    interface MessageData {
        user: string;
        speaker: SpeakerData;
    }

    namespace Chai {
        interface AssertStatic {
            equal(actual: unknown, expected: unknown, message?: string);
        }
    }
}

declare module "fvtt-types/configuration" {
    namespace Hooks {
        import type { ChatCommands } from "commander";

        interface HookConfig {
            chatCommandsReady(chatCommands: ChatCommands): void;
            quenchReady(quench: Quench): void;
            "socketlib.ready": () => void;
        }
    }
}

export {};
