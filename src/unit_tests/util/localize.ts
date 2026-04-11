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

    describe("Added Adjectives", function() {
        it("Should localize them", function() {
            expect(game?.i18n?.localize(CONFIG.Token.adjectivesPrefix + ".morose")).to.eqls("Morose")
        });
        it("Should include the added ones", function() {

            const translations = game.i18n?.translations;
            expect(translations).to.not.eq(undefined)
            if (translations) {
                const adjectives = foundry.utils.getProperty(game.i18n.translations, CONFIG.Token.adjectivesPrefix);

                expect(adjectives).to.contain.keys("morose");
                expect(adjectives).to.contain.keys("unhelpful");
            }
        });
    })

}
