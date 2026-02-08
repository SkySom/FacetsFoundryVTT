import type { ChatCommands } from "commander";
import { localize } from "../../util/localize";

export abstract class Autocomplete {
    abstract toHTMLElement(chatCommands: ChatCommands): HTMLElement;
}

export class CommandAutocomplete extends Autocomplete {
    constructor(
        readonly alias: string,
        readonly command: string
    ) {
        super();
    }

    override toHTMLElement(chatCommands: ChatCommands): HTMLElement {
        return chatCommands.createCommandElement(`${this.alias} ${this.command}`, this.command);
    }
}

export class LocalizedInfoAutocomplete extends Autocomplete {
    constructor(readonly infoKey: string) {
        super();
    }

    override toHTMLElement(chatCommands: ChatCommands): HTMLElement {
        return chatCommands.createInfoElement(localize(this.infoKey));
    }
}

export class LocalizedNoteAutocomplete extends Autocomplete {
    constructor(readonly noteKey: string) {
        super();
    }

    override toHTMLElement(chatCommands: ChatCommands): HTMLElement {
        return chatCommands.createInfoElement(`<hr><p class="notes">${localize(this.noteKey)}</p>`);
    }
}
