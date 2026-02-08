import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { localize } from "../../module/util/localize";

export function registerLocaleSuite(context: QuenchBatchContext) {
    const { describe, it, expect } = context;

    describe("Locale Handling", function() {
        it("Should localize Test.Message correct", function() {
            const localized = localize("Test.Message");

            expect(localized).to.eqls("A Message");
        });
    });
}
