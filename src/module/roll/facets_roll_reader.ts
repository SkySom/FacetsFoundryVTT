import type { FacetsRollData } from "./facets_roll_data.ts";
import {
    ErrorToken,
    type RollToken,
    RollTokenProviderRegistry,
    SuggestionToken,
} from "./token/roll_token.ts";

export class FacetsRollReader {
    private fomula: string;
    private data: FacetsRollData<string>;

    constructor(fomula: string, data: FacetsRollData<string> = {}) {
        this.fomula = fomula;
        this.data = data;
    }

    evaluate(suggest: boolean = false): FacetsRollReadResult {
        let formulaTokens = this.fomula.split(" ");
        let length = formulaTokens.length;
        let rollTokens: Array<RollToken> = [];

        this.checkDepth();
        for (let position = 0; position < length; position++) {
            let currentToken = formulaTokens[position];
            let suggestToken = suggest && position == length - 1;
            if (currentToken.length > 0) {
                let generatedToken = this.convertToken(
                    currentToken,
                    suggestToken,
                );
                if (generatedToken instanceof ErrorToken) {
                    return new RollReadFail(generatedToken.error);
                } else if (generatedToken instanceof SuggestionToken) {
                    if (suggestToken) {
                        return new RollReadSuggest(generatedToken.suggestions);
                    } else {
                        return new ErrorToken("Tried to suggest for evaluation without suggestion")
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

    private convertToken(
        token: string,
        suggest: boolean,
    ): RollToken | SuggestionToken | ErrorToken {
        for (let provider of RollTokenProviderRegistry.getProviders()) {
            let provided = provider.provide(token, suggest, this.data);
            if (
                provided instanceof SuggestionToken ||
                provided instanceof ErrorToken
            ) {
                return provided;
            } else if (provided != null) {
                return provided;
            }
        }

        return new ErrorToken(
            "Could not convert " + token + " into valid roll token",
        );
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

type FacetsRollReadResult = RollReadSuccess | RollReadSuggest | RollReadFail;

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
