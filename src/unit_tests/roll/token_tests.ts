import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import type { DiceCreator } from "../../module/roll/dice/dice_creator";
import { DiceCreatorRegistry } from "../../module/roll/dice/dice_creator_registry";
import { RegularRollValueCategory } from "../../module/roll/dice/regular/regular_dice_category";
import { DiceRollToken, DiceRollTokenProvider } from "../../module/roll/token/dice_token";
import { FlatModifierToken, FlatModifierTokenProvider } from "../../module/roll/token/flat_modifier_token";
import { ErrorToken, SuggestionToken } from "../../module/roll/token/roll_token";

export function registerRollTokenSuite(context: QuenchBatchContext) {
    flatModifierToken(context);
    diceToken(context);
}

function flatModifierToken(context: QuenchBatchContext): void {
    const { describe, it, expect } = context;

    describe("Flat Modifier Token", function () {
        it("+3 should return a valid token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide("+3", false);

            expect(provided).to.eqls(new FlatModifierToken(3));
        });

        it("-3 should return a valid token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide("-3", false);
            expect(provided).to.eqls(new FlatModifierToken(-3));
        });

        it("- should return an error token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide("-", false);
            expect(provided).to.eqls(new ErrorToken("- is not a valid flat modifier"));
        });

        it("-a should return an error token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide("-a", false);
            expect(provided).to.eqls(new ErrorToken("-a is not a valid flat modifier"));
        });

        it("aaaa should return nothing", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide("aaaa", false);
            expect(provided).to.eqls(null);
        });

        it("+ should return suggestions", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide("+", true);
            expect(provided).to.eqls(new SuggestionToken(new Set(["+1", "+2", "+3", "+4", "+5"])));
        });
    });
}

function diceToken(context: QuenchBatchContext): void {
    const { describe, it, expect, assert } = context;

    describe("Dice Token", function () {
        it("d6 should return a single Regular d6", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("d6", false);

            expect(provided).to.eqls(new DiceRollToken(RegularRollValueCategory.REGULAR_DICE_CREATOR, 6, 1));
        });

        it("3ad12 should return 3 Assured d12", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("3ad12", false);

            expect(provided).to.eqls(createAssuredDiceToken("d", 12, 3, assert));
        });

        it("3acd12 should return 3 Assured cd12", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("3acd12", false);

            expect(provided).to.eqls(createAssuredDiceToken("cd", 12, 3, assert));
        });

        it("aaaa should return nothing", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("aaaa", false);

            expect(provided).to.eqls(null);
        });

        it("2zd12 should return Error of no dice found", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("2zd12", false);

            expect(provided).to.eqls(new ErrorToken("No Dice for zd"));
        });

        it("2d1 should return suggestions", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("2d1", true);

            expect(provided).to.eqls(new SuggestionToken(new Set(["2d12", "2d10"])));
        });

        it("d1 should return suggestions", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("d1", true);

            expect(provided).to.eqls(new SuggestionToken(new Set(["d12", "d10"])));
        });

        it("d should return suggestions", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("d", true);

            expect(provided).to.eqls(new SuggestionToken(new Set(["d12", "d10", "d8", "d6", "d4"])));
        });

        it("d should return errors", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("d", false);

            expect(provided).to.eqls(new ErrorToken("d is not a valid dice token"));
        });

        it("2 should return suggestions", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("2", true);

            expect(provided).to.eqls(new SuggestionToken(new Set(["2d12", "2d10", "2d8", "2d6", "2d4"])));
        });

        it("2a should return suggestions", function () {
            const provided = DiceRollTokenProvider.INSTANCE.provide("2a", true);
            console.log(provided);
            expect(provided).to.eqls(new SuggestionToken(new Set(["2ad12", "2ad10", "2ad8", "2ad6", "2ad4"])));
        });
    });
}

function createAssuredDiceToken(
    type: string,
    facets: number,
    amount: number,
    assert: Chai.AssertStatic
): DiceRollToken {
    const assuredDiceCreator: DiceCreator | undefined = DiceCreatorRegistry.ASSURED_DICE_CREATORS.get("a" + type);

    assert(
        assuredDiceCreator,
        "a" + type + " does not exist in " + JSON.stringify(DiceCreatorRegistry.ASSURED_DICE_CREATORS.keys())
    );

    return new DiceRollToken(assuredDiceCreator, facets, amount);
}
