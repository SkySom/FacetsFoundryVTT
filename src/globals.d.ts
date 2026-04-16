import { ActorFacets } from "@actor";
import { ItemFacets } from "@item";

import type { PartyData } from "@actor/data/party";
import type { PlayerCharacterData } from "@actor/data/player_character";
import type { RollResultChatData } from "@data/chat/roll_result";
import type { FacetsChatMessage } from "@documents/chat/chat_message";
import type { Quench } from "@ethaks/fvtt-quench";
import type { BackgroundCharacterData } from "@data/actor/background_character";
import type { FacetsCombat } from "@documents/combat/combat";
import type { FacetsCombatant } from "@documents/combat/combatant";
import type { FacetsBaseActorData } from "@actor/data/base";
import type { ForegroundCharacterData, SpotlightCharacterData } from "@data/actor";

declare global {
    interface Game {
        chatCommands: ChatCommands;
    }

    interface SettingConfig {
        "facets.recentRolls": string[];
        "facets.activeParty": string;
        "facets.createdFirstParty": foundry.data.fields.BooleanField;
        "facets.backgroundCharacterAutoSetup": foundry.data.fields.BooleanField;
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
            base: typeof FacetsBaseActorData;
            backgroundCharacter: typeof BackgroundCharacterData;
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
        }
    }
}

declare module "commander" {
    interface ChatCommands {
        register(command: ChatCommand, override: boolean = false): void;

        createCommandElement(command: string, content: string): HTMLElement;

        createInfoElement(content: string): HTMLElement;
    }

    interface ChatCommand {
        name: string;
        module: string;
        aliases: string[];
        description?: string;
        icon?: string;
        requiredRoles?: string;
        autocompleteCallback?: (menu: AutocompleteMenu, alias: string, parameters: string) => string[] | HTMLElement[];
        callback: (chatLog: ChatLog, parameters: string, messageData: MessageData) => object | Promise | null;
        closeOnComplete?: boolean;
    }

    interface AutocompleteMenu {
        visible: boolean;
        container: HTMLElement;
        chatInput: HTMLTextAreaElement;
        suggestionArea: HTMLTextAreaElement;
        maxEntries: number;
        showFooter: boolean;
        currentCommand?: ChatCommand;
    }
}
