import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { AssistanceRollValueCategory } from "@roll/dice/assistance/assistance_dice_category";
import { KeptRollValueCategory } from "@roll/dice/kept/kept_dice_category";
import { PlotRollValueCategory } from "@roll/dice/plot/plot_dice_category";
import { RegularRollValueCategory } from "../../module/roll/dice/regular/regular_dice_category";
import { roll } from "./_roll_test_util";

export function registerRollValueCategorySuite(context: QuenchBatchContext) {
    regularRollCategory(context);
    plotRollCategory(context);
    keptRollCategory(context);
    assistanceRollCategory(context);
}

function regularRollCategory(context: QuenchBatchContext) {
    const { describe, it, expect, assert } = context;

    describe("Regular Roll Value Category", function () {
        it("It should keep all values if less than default kept value of 2", async function () {
            const rolled = await roll(["ad6"], assert);

            const picked = RegularRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);
        });

        it("It should keep only keep the two highest 2 positive values even there are more", async function () {
            const rolled = await roll(["ad6", "ad8", "ad10"], assert);

            const picked = RegularRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(2);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([10, 8]);

            const total = pickedValues.reduce((sum, pickedValue) => sum + pickedValue, 0);
            expect(total).to.eq(18);
        });

        it("It should keep the two highest positive and two highest negative", async function () {
            const rolled = await roll(["ad6", "ad8", "ad10", "ad12", "acd6", "acd8", "acd10"], assert);

            const picked = RegularRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(4);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([12, 10, -10, -8]);

            const total = pickedValues.reduce((sum, pickedValue) => sum + pickedValue, 0);
            expect(total).to.eq(4);
        });
    });
}

function plotRollCategory(context: QuenchBatchContext) {
    const { describe, it, expect, assert } = context;

    describe("Plot Roll Value Category", function () {
        it("Should always equal at least half if only one dice", async function () {
            const rolled = await roll(["rpd8"], assert);

            const picked = PlotRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([4]);
        });

        it("Should not change value if at least half and only one dice", async function () {
            const rolled = await roll(["apd8"], assert);

            const picked = PlotRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([8]);
        });

        it("Should pick highest if more than one dice", async function () {
            const rolled = await roll(["apd8", "apd6"], assert);

            const picked = PlotRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([8]);
        });

        it("Should pick highest if more than one dice", async function () {
            const rolled = await roll(["apd8", "apd6"], assert);

            const picked = PlotRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([8]);
        });
    });
}

function keptRollCategory(context: QuenchBatchContext) {
    const { describe, it, expect, assert } = context;

    describe("Kept Roll Value Category", function () {
        it("Should always keep everything", async function () {
            const rolled = await roll(["akd8", "akd10", "akd12", "rkd10"], assert);

            const picked = KeptRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(4);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([8, 10, 12, 1]);

            const total = pickedValues.reduce((sum, pickedValue) => sum + pickedValue, 0);
            expect(total).to.eq(31);
        });
    });
}

function assistanceRollCategory(context: QuenchBatchContext) {
    const { describe, it, expect, assert } = context;

    describe("Assistance Roll Value Category", function () {
        it("Should keep highest", async function () {
            const rolled = await roll(["asd8", "asd10", "asd12", "rsd10"], assert);

            const picked = AssistanceRollValueCategory.INSTANCE.pickValues(rolled);

            expect(picked).to.have.lengthOf(1);

            const pickedValues = picked.map((pick) => pick.value());
            expect(pickedValues).to.eqls([12]);
        });
    });
}
