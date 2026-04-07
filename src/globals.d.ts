import { ActorFacets } from "@actor";
import { ItemFacets } from "@item";

import type { Quench } from "@ethaks/fvtt-quench";
import type { PartyData } from "@actor/data/party";
import type { PlayerCharacterData } from "@actor/data/player_character";

declare global {
    interface Game {
        chatCommands: ChatCommands;
    }

    interface SettingConfig {
        "facets.recentRolls": string[];
        "facets.activeParty": string;
        "facets.createdFirstParty": foundry.data.fields.BooleanField;
    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets<Actor.SubType>;
        Item: typeof ItemFacets;
    }

    interface DataModelConfig {
        Actor: {
            playerCharacter: typeof PlayerCharacterData
            party: typeof PartyData;
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
