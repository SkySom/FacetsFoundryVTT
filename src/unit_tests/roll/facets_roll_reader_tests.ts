import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { FacetsRollReader, RollReadFail, RollReadSuccess, RollReadSuggest } from "../../module/roll/facets_roll_reader";
import { FlatModifierToken } from "../../module/roll/token/flat_modifier_token";

export function registerRollReaderSuite(context: QuenchBatchContext) {
    const { describe, it, expect } = context;

    describe("Roll Reader", function () {
        it("Should parse a valid fomula", function () {
            const rollReader = new FacetsRollReader("+3", {});

            const result = rollReader.evaluate();

            expect(result).to.eqls(new RollReadSuccess([new FlatModifierToken(3)]));
        });

        it("1d6 3d8 + d8 should error", function () {
            const rollReader = new FacetsRollReader("1d6 3d8 + d8", {});

            const result = rollReader.evaluate();

            expect(result).to.eqls(new RollReadFail("+ is not a valid flat modifier"));
        });

        it("6d6 +3 3a should suggest", function () {
            const rollReader = new FacetsRollReader("6d6 +3 3a", {});

            const result = rollReader.evaluate(true);

            expect(result).to.eqls(
                new RollReadSuggest(
                    new Set(["6d6 +3 3ad12", "6d6 +3 3ad10", "6d6 +3 3ad8", "6d6 +3 3ad6", "6d6 +3 3ad4"])
                )
            );
        });

        it("6d6 3ad12 - should suggest", function () {
            const rollReader = new FacetsRollReader("6d6 3ad12 -", {});

            const result = rollReader.evaluate(true);

            expect(result).to.eqls(
                new RollReadSuggest(
                    new Set(["6d6 3ad12 -1", "6d6 3ad12 -2", "6d6 3ad12 -3", "6d6 3ad12 -4", "6d6 3ad12 -5"])
                )
            );
        });

        it("6d6 3ad12 - d6 should error even if suggest", function () {
            const rollReader = new FacetsRollReader("6d6 3ad12 - d6", {});

            const result = rollReader.evaluate(true);

            expect(result).to.eqls(new RollReadFail("- is not a valid flat modifier"));
        });
    });
}
