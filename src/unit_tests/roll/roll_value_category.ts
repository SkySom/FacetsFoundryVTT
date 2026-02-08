import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { RegularDiceValueCategory } from "../../module/roll/dice/regular/regular_dice_category";
import { DiceRollTokenProvider } from "../../module/roll/token/dice_token";
import { ErrorToken, SuggestionToken } from "../../module/roll/token/roll_token";
import { RollValue } from "../../module/roll/value/roll_value";

export function registerRollValueCategorySuite(context: QuenchBatchContext) {
    regularRollCategory(context);
}

function regularRollCategory(context: QuenchBatchContext) {
    const { describe, it, expect, assert } = context;

    describe("Regular Roll Value Category", function () {
        it("It should keep all values if less than default kept value of 2", async function () {
            const rolled = await roll(["ad6"], assert);

            const picked = RegularDiceValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);
        });

        it("It should keep only keep the two highest 2 positive values even there are more", async function () {
            const rolled = await roll(["ad6", "ad8", "ad10"], assert);

            const picked = RegularDiceValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(2);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([10, 8]);

                        const total = pickedValues.reduce((sum, pickedValue) => sum + pickedValue, 0);
                        expect(total).to.eq(18);
        });

        it("It should keep the two highest positive and two highest negative", async function () {
            const rolled = await roll(["ad6", "ad8", "ad10", "ad12", "acd6", "acd8", "acd10"], assert);

            const picked = RegularDiceValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(4);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([12, 10, -10, -8]);

            const total = pickedValues.reduce((sum, pickedValue) => sum + pickedValue, 0)
            expect(total).to.eq(4)
        });
    });
}

async function roll(dice: Array<string>, assert: Chai.AssertStatic): Promise<Array<RollValue>> {
    const rollValues: Array<RollValue> = dice
        .map((dice) => {
            const token = DiceRollTokenProvider.INSTANCE.provide(dice, false);
            if (token instanceof ErrorToken) {
                assert.fail("Found Error Token: " + token.error);
            } else if (token instanceof SuggestionToken) {
                assert.fail("Found Suggestion Token: " + JSON.stringify(token.suggestions));
            } else if (token == null) {
                assert.fail("Failed to find token");
            }
            return token;
        })
        .flatMap((token) => {
            return token.provide();
        });

    const promises = rollValues.map((rollValue) => rollValue.evaluate());
    return Promise.all(promises).then(() => rollValues);
}
