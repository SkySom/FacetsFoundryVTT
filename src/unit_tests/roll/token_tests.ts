import type { QuenchBatchContext } from "@ethaks/fvtt-quench";
import {
    ErrorToken,
    SuggestionToken,
} from "../../module/roll/token/roll_token";
import {
    FlatModifierToken,
    FlatModifierTokenProvider,
} from "../../module/roll/token/flat_modifier_token";

export function registerRollTokenSuite(context: QuenchBatchContext) {
    const { describe, it, expect } = context;

    describe("Flat Modifier Token", function () {
        it("+3 should return a valid token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide(
                "+3",
                false,
                {},
            );

            expect(provided).to.eqls([new FlatModifierToken(3)]);
        });
        it("-3 should return a valid token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide(
                "-3",
                false,
                {},
            );
            expect(provided).to.eqls([new FlatModifierToken(-3)]);
        });
        it("- should return an error token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide(
                "-",
                false,
                {},
            );
            expect(provided).to.eqls(
                new ErrorToken("- is not a valid flat modifier"),
            );
        });
        it("-a should return an error token", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide(
                "-a",
                false,
                {},
            );
            expect(provided).to.eqls(
                new ErrorToken("-a is not a valid flat modifier"),
            );
        });
        it("aaaa should return nothing", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide(
                "aaaa",
                false,
                {},
            );
            expect(provided).to.eqls([]);
        });
        it("+ should return suggestions", function () {
            const provided = FlatModifierTokenProvider.INSTANCE.provide(
                "+",
                true,
                {},
            );
            expect(provided).to.eqls(
                new SuggestionToken(new Set(["+1", "+2", "+3", "+4", "+5"])),
            );
        });
    });
}
