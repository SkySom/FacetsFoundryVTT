import type { FacetsRollData } from "../facets_roll_data";
import { FlatModifierTokenProvider } from "./flat_modifier_token";
import { DiceRollTokenProvider } from "./dice_token";
import type { RollValue } from "../value/roll_value";

export interface RollToken {
    provide(): Array<RollValue>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRollToken(object: any): object is RollToken {
    return object !== null && typeof object.provide === "function";
}

export interface RollTokenProvider<T extends RollToken> {
    provide(
        token: string,
        suggest: boolean,
        data: FacetsRollData<string>,
    ): T | SuggestionToken | ErrorToken | null;
}

export class RollTokenProviderRegistry {
    private static readonly ROLL_TOKEN_PROVIDERS: Array<
        RollTokenProvider<RollToken>
    > = [DiceRollTokenProvider.INSTANCE, FlatModifierTokenProvider.INSTANCE];

    static getProviders(): Array<RollTokenProvider<RollToken>> {
        return this.ROLL_TOKEN_PROVIDERS;
    }
}

export class SuggestionToken implements RollToken {
    suggestions: Set<string>;

    constructor(suggestions: Set<string>) {
        this.suggestions = suggestions;
    }

    provide(): Array<RollValue> {
        throw new Error("Suggestions cannot provide Dice");
    }
}

export class ErrorToken implements RollToken {
    readonly error: string;

    constructor(error: string) {
        this.error = error;
    }

    provide(): Array<RollValue> {
        throw new Error(this.error);
    }
}
