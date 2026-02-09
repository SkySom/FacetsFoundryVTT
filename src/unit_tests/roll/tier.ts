import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { getRollTiers, RollTier, TierResult } from "@roll/tier";

export function registerTierSuite(context: QuenchBatchContext) {
    const { describe, it, expect } = context;

    describe("Roll Tier", function () {
        it("Should return NONE,undefined for 0", function () {
            expect(getRollTiers(0)).to.eqls(new TierResult(RollTier.NONE));
        });

        it("Should return AVERAGE,undefined for 8", function () {
            expect(getRollTiers(8)).to.eqls(new TierResult(RollTier.AVERAGE));
        });

        it("Should return HARD,EASY for 11", function () {
            expect(getRollTiers(11)).to.eqls(new TierResult(RollTier.HARD, RollTier.EASY));
        });

        it("Should return Heroic,Formidable for 22", function () {
            expect(getRollTiers(22)).to.eqls(new TierResult(RollTier.HEROIC, RollTier.FORMIDABLE));
        });

        it("Should return Impossible,Incredible for 32", function () {
            expect(getRollTiers(32)).to.eqls(new TierResult(RollTier.IMPOSSIBLE, RollTier.INCREDIBLE));
        });
    });
}
