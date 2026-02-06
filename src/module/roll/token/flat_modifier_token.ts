import {
    ErrorToken,
    SuggestionToken,
    type RollToken,
    type RollTokenProvider,
} from "./roll_token";
import { FlatRollValue } from "../value/flat_value";
import type { RollValue } from "../value/roll_value";

export class FlatModifierToken implements RollToken {
    readonly modifier: number;

    constructor(modifier: number) {
        this.modifier = modifier;
    }

    provide(): Array<RollValue> {
        return [new FlatRollValue(this.modifier)];
    }
}

export class FlatModifierTokenProvider
    implements RollTokenProvider<FlatModifierToken>
{
    static readonly INSTANCE: FlatModifierTokenProvider =
        new FlatModifierTokenProvider();

    readonly fullPattern: RegExp = /^[\+-]\d+$/;

    provide(
        token: string,
        suggest: boolean,
        _data: object,
    ): FlatModifierToken | SuggestionToken | ErrorToken | null {
        if (this.fullPattern.test(token)) {
            return new FlatModifierToken(parseInt(token));
        } else if (suggest && (token == "+" || token == "-")) {
            let suggestions: Set<string> = new Set();
            for (let i = 1; i < 6; i++) {
                suggestions.add(token + i);
            }
            return new SuggestionToken(suggestions);
        } else if (token.startsWith("+") || token.startsWith("-")) {
            return new ErrorToken(token + " is not a valid flat modifier");
        }

        return null;
    }
}
