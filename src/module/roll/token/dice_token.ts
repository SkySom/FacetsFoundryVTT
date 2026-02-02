import { DiceCreatorRegistry } from "../dice/dice_creator";
import {
    ErrorToken,
    type RollToken,
    type RollTokenProvider,
    type SuggestionToken,
} from "./roll_token";
import type { RollValue } from "../value/roll_value";

export class DiceRollTokenProvider implements RollTokenProvider<DiceRollToken> {
    public static readonly INSTANCE: DiceRollTokenProvider =
        new DiceRollTokenProvider();

    readonly fullPattern: RegExp =
        /^(?<amount>\d+)?(?<dice>\w?d)(?<facets>\d+)$/;

    provide(
        token: string,
        _suggest: boolean,
        _data: object,
    ): Array<DiceRollToken> | SuggestionToken | ErrorToken {
        let match = token.match(this.fullPattern);

        if (match?.groups) {
            let amount = parseInt(match.groups.amount ?? "1");
            let typeString = match.groups.dice;
            let facets = parseInt(match.groups.facets);

            if (DiceCreatorRegistry.getDiceCreator(typeString) == null) {
                return new ErrorToken("No Dice for " + typeString);
            } else {
                return [new DiceRollToken(amount, typeString, facets)];
            }
        }

        return [];
    }
}

class DiceRollToken implements RollToken {
    readonly number: number;
    readonly diceType: string;
    readonly facets: number;

    constructor(number: number = 1, diceType: string, facets: number) {
        this.number = number;
        this.diceType = diceType;
        this.facets = facets;
    }

    provide(): Array<RollValue> {
        return [];
    }
}
