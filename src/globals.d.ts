import { ActorFacets } from "@actor";
import { ItemFacets } from "@item";

import type { ForegroundCharacterData, SpotlightCharacterData } from "@data/actor";
import type { BackgroundCharacterData } from "@data/actor/background_character";
import type { CompanionData } from "@data/actor/companion";
import type { PartyData } from "@data/actor/party";
import type { PlayerCharacterData } from "@data/actor/player_character";
import type { RollResultChatData } from "@data/chat/roll_result";
import type { FacetsChatMessage } from "@documents/chat/chat_message";
import type { FacetsCombat } from "@documents/combat/combat";
import type { FacetsCombatant } from "@documents/combat/combatant";
import type { Quench } from "@ethaks/fvtt-quench";
import type FacetsUser from "@documents/user/facets_user";

declare global {
    const socketlib: SocketLib;

    interface Game {
        facets: Facets;
        chatCommands: ChatCommands;
    }

    interface FlagConfig {
        User: {
            facets: {
                remoteUserId: number;
                remoteToken: string;
            };
        };
    }

    interface SettingConfig {
        "facets.recentRolls": string[];
        "facets.activeParty": string;
        "facets.createdFirstParty": foundry.data.fields.BooleanField;
        "facets.backgroundCharacterAutoSetup": foundry.data.fields.BooleanField<{ initial: true }>;
        "facets.doomAndPlotLocation": foundry.data.fields.StringField<{
            initial: DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL;
            choices: [DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL, DOOM_AND_PLOT_CONSTANTS.LOCATION.REMOTE];
        }>;
        "facets.doomAndPlotUrl": foundry.data.fields.StringField<{
            initial: "";
        }>;
        "facets.doomAndPlotToken": foundry.data.fields.StringField<{
            initial: "";
        }>;
    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets<Actor.SubType>;
        Combat: typeof FacetsCombat<Combat.SubType>;
        Combatant: typeof FacetsCombatant<Combatant.SubType>;
        ChatMessage: typeof FacetsChatMessage<ChatMessage.SubType>;
        Item: typeof ItemFacets;
        User: typeof FacetsUser;
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
