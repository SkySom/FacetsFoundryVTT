import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { roll } from "./_roll_test_util";
import { DiceResult, FacetsRollCategoryResult } from "@roll/facets_roll_result";
import { RegularRollValueCategory } from "@roll/dice/regular/regular_dice_category";

export function registerFacetsRollResultSuite(context: QuenchBatchContext) {
    const { describe, it, expect, assert } = context;

    describe("Facets Roll Results", function () {
        it("Should Properly only select dice for it's pool", async function () {
            const rolls = await roll(["ad10", "ad8", "akd6", "asd4", "apd12"], assert);

            const result = FacetsRollCategoryResult.fromRollValues(RegularRollValueCategory.INSTANCE, rolls, {
                kept: 2
            });

            expect(result).to.eqls(
                new FacetsRollCategoryResult(RegularRollValueCategory.INSTANCE, 18, [
                    new DiceResult(10, 10, true),
                    new DiceResult(8, 8, true)
                ])
            );
        });

        it("Should Set selected right and maintain order", async function () {
            const rolls = await roll(["ad10", "ad8", "akd6", "asd4", "apd12", "ad12", "ad4"], assert);

            const result = FacetsRollCategoryResult.fromRollValues(RegularRollValueCategory.INSTANCE, rolls, {
                kept: 2
            });

            expect(result).to.eqls(
                new FacetsRollCategoryResult(RegularRollValueCategory.INSTANCE, 22, [
                    new DiceResult(10, 10, true),
                    new DiceResult(8, 8, false),
                    new DiceResult(12, 12, true),
                    new DiceResult(4, 4, false)
                ])
            );
        });
    });
}
