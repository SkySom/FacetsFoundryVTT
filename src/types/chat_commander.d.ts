
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
