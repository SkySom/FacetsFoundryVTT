import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { FacetsRollReader, RollReadSuccess } from "../../module/roll/facets_roll_reader";
import { FlatModifierToken } from "../../module/roll/token/flat_modifier_token";

export function registerRollReaderSuite(context: QuenchBatchContext) {
    const { describe, it, expect } = context;

    describe("Roll Reader", function () {
        it("Should parse a valid fomula", function() {
            let rollReader = new FacetsRollReader("+3", {});

            let result = rollReader.evaluate();

            expect(result).to.eqls(new RollReadSuccess([new FlatModifierToken(3)]))
        })

    });
}
