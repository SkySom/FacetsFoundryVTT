import {ActorFacets} from "@actor";
import {ItemFacets} from "@item";

declare global {
    interface CONFIG {

    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets;
        Item: typeof ItemFacets;
    }



    interface MessageData {
        user: string;
        speaker: SpeakerData
    }
}

declare namespace Hooks {
    import type {ChatCommands} from 'chat-commander'

    interface StaticCallbacks {
        chatCommandsReady: (chatCommands: ChatCommands) => void;


    }
}

declare module 'chat-commander' {
    interface ChatCommands {
        register(command: ChatCommand, override: boolean = false): void
    }

    interface ChatCommand {
        name: string,
        module: String,
        aliases: string[],
        description?: string,
        icon?: string,
        requiredRoles?: string,
        callback: (chatLog: ChatLog, parameters: string, messageData: MessageData) => object | Promise | null,
        closeOnComplete?: boolean
    }
}
