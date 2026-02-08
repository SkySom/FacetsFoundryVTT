import { DiceCreator } from "../dice/dice_creator";
import { DiceCreatorRegistry } from "../dice/dice_creator_registry";
import { DiceValue } from "../value/dice_value";
import type { RollValue } from "../value/roll_value";
import { ErrorToken, SuggestionToken, type RollToken, type RollTokenProvider } from "./roll_token";

export class DiceRollTokenProvider implements RollTokenProvider<DiceRollToken> {
    public static readonly INSTANCE: DiceRollTokenProvider = new DiceRollTokenProvider();

    readonly fullPattern: RegExp = /^(?<amount>\d+)?(?<dice>\w{0,2}d)(?<facets>\d+)$/;

    readonly partialPattern: RegExp = /^(?<amount>\d+)?(?<dice>\w\w?d?)?(?<facets>\d+)?$/;

    provide(token: string, suggest: boolean): DiceRollToken | SuggestionToken | ErrorToken | null {
        const match = token.match(this.fullPattern);

        if (match?.groups) {
            const amount = parseInt(match.groups.amount ?? "1");
            const typeString = match.groups.dice;
            const facets = parseInt(match.groups.facets);

            const diceCreator = DiceCreatorRegistry.getDiceCreator(typeString);
            if (diceCreator == null) {
                return new ErrorToken("No Dice for " + typeString);
            } else if (facets == 1 && suggest) {
                return new SuggestionToken(
                    new Set([
                        (match.groups.amount ?? "") + typeString + "12",
                        (match.groups.amount ?? "") + typeString + "10"
                    ])
                );
            } else {
                return new DiceRollToken(diceCreator, facets, amount);
            }
        } else {
            console.log("No groups found");
        }

        return this.testPartial(token, suggest);
    }

    private testPartial(token: string, suggest: boolean): SuggestionToken | ErrorToken | null {
        const partialMatch = token.match(this.partialPattern);

        if (partialMatch?.groups) {
            const groups = partialMatch.groups;
            if (groups.amount) {
                if (!groups.dice) {
                    if (suggest) {
                        return new SuggestionToken(
                            new Set([
                                groups.amount + "d12",
                                groups.amount + "d10",
                                groups.amount + "d8",
                                groups.amount + "d6",
                                groups.amount + "d4"
                            ])
                        );
                    } else {
                        return new ErrorToken(token + " is not a valid dice token");
                    }
                } else {
                    const suggested = this.suggestDice(suggest, token, groups.dice, groups.amount, groups.facets);
                    if (suggested != null) {
                        return suggested;
                    }
                }
            } else if (groups.dice) {
                const suggested = this.suggestDice(suggest, token, groups.dice, groups.amount, groups.facets);
                if (suggested != null) {
                    return suggested;
                }
            }
        }

        return null;
    }

    private suggestDice(
        suggest: boolean,
        token: string,
        dice: string,
        amount?: string,
        facets?: string
    ): SuggestionToken | ErrorToken | null {
        let foundDice: string | undefined = undefined;
        if (DiceCreatorRegistry.getDiceCreator(dice) != null) {
            foundDice = dice;
        } else if (DiceCreatorRegistry.getDiceCreator(dice + "d") != null) {
            foundDice = dice + "d";
        }

        const amountFound = amount ?? "";

        if (foundDice) {
            if (suggest) {
                if (facets == "1") {
                    return new SuggestionToken(
                        new Set([amountFound + foundDice + "12", amountFound + foundDice + "10"])
                    );
                } else if (!facets) {
                    return new SuggestionToken(
                        new Set([
                            amountFound + foundDice + "12",
                            amountFound + foundDice + "10",
                            amountFound + foundDice + "8",
                            amountFound + foundDice + "6",
                            amountFound + foundDice + "4"
                        ])
                    );
                }
            } else if (!facets) {
                return new ErrorToken(token + " is not a valid dice token");
            }
        }

        return null;
    }
}

export class DiceRollToken implements RollToken {
    constructor(
        readonly diceCreator: DiceCreator,
        readonly faces: number,
        readonly count: number
    ) {}

    provide(): Array<RollValue> {
        const rollValues: Array<RollValue> = [];

        for (let i = 0; i < this.count; i++) {
            rollValues.push(new DiceValue(this.diceCreator.create(this.faces)));
        }
        return rollValues;
    }
}
