import { ActorFacets } from "@actor";
import { ItemFacets } from "@item";

import type { Quench } from "@ethaks/fvtt-quench";

declare global {
    namespace CONFIG {
        interface Dice {
            FacetsRoll: Document.ImplementationClassFor<"FacetsRoll">;
        }
    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets;
        Item: typeof ItemFacets;
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
