import type { FacetsRollData } from "./facets_roll_data.ts";
import { ErrorToken, type RollToken, RollTokenProviderRegistry, SuggestionToken } from "./token/roll_token.ts";

export class FacetsRollReader {
    private fomula: string;
    private data: FacetsRollData<string>;

    constructor(fomula: string, data: FacetsRollData<string> = {}) {
        this.fomula = fomula;
        this.data = data;
    }

    evaluate(suggest: boolean = false): FacetsRollReadResult {
        const formulaTokens = this.fomula.split(" ");
        const length = formulaTokens.length;
        const rollTokens: Array<RollToken> = [];

        this.checkDepth();
        for (let position = 0; position < length; position++) {
            const currentToken = formulaTokens[position];
            const suggestToken = suggest && position == length - 1;
            if (currentToken.length > 0) {
                const generatedToken = this.convertToken(currentToken, suggestToken);
                if (generatedToken instanceof ErrorToken) {
                    return new RollReadFail(generatedToken.error);
                } else if (generatedToken instanceof SuggestionToken) {
                    if (suggestToken) {
                        const suggestions: string[] = [];
                        for (const suggestion of generatedToken.suggestions) {
                            const lastSpace = this.fomula.lastIndexOf(" ");
                            if (lastSpace < 0) {
                                suggestions.push(suggestion);
                            } else {
                                suggestions.push(this.fomula.slice(0, lastSpace) + " " + suggestion);
                            }
                        }
                        return new RollReadSuggest(new Set(suggestions));
                    } else {
                        return new ErrorToken("Tried to suggest for evaluation without suggestion");
                    }
                } else {
                    rollTokens.push(generatedToken);
                }
            }
        }

        if (rollTokens.length == 0) {
            return new RollReadFail("No Tokens Found");
        }

        return new RollReadSuccess(rollTokens);
    }

    private convertToken(token: string, suggest: boolean): RollToken | SuggestionToken | ErrorToken {
        for (const provider of RollTokenProviderRegistry.getProviders()) {
            const provided = provider.provide(token, suggest, this.data);
            if (provided instanceof SuggestionToken || provided instanceof ErrorToken) {
                return provided;
            } else if (provided != null) {
                return provided;
            }
        }

        return new ErrorToken("Could not convert " + token + " into valid roll token");
    }

    private checkDepth(): void {
        let depth = this.data["depth"];

        if (depth == null || typeof depth !== "string") {
            this.data["depth"] = "1";
        } else if (typeof depth === "string") {
            depth = "" + (parseInt(depth) + 1);
            this.data["depth"] = depth;
        }

        if (typeof depth === "string" && parseInt(depth) > 8) {
            throw new Error("Found Cycling Dice Pools");
        }
    }
}

export type FacetsRollReadResult = RollReadSuccess | RollReadSuggest | RollReadFail;

export class RollReadSuccess {
    readonly rollTokens: Array<RollToken>;

    constructor(rollTokens: Array<RollToken>) {
        this.rollTokens = rollTokens;
    }
}

export class RollReadSuggest {
    readonly suggestions: Set<string>;

    constructor(suggestions: Set<string>) {
        this.suggestions = suggestions;
    }
}

export class RollReadFail {
    readonly error: string;

    constructor(error: string) {
        this.error = error;
    }
}
