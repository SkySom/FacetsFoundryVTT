import type { Quench } from "@ethaks/fvtt-quench";
import { registerRollReaderSuite } from "./facets_roll_reader_tests";
import { registerRollTokenSuite } from "./token_tests";
import { registerRollValueCategorySuite } from "./roll_value_category";
import { registerTierSuite } from "./tier";
import { registerFacetsRollResultSuite } from "./facets_roll_result";

export function registerRollBatch(quench: Quench) {
    quench.registerBatch(
        "facets.roll.parse",
        (context) => {
            registerRollReaderSuite(context);
            registerRollTokenSuite(context);
        },
        {
            displayName: "Facets: Roll Parsing Tests"
        }
    );

    quench.registerBatch(
        "facets.roll.rolling",
        (context) => {
            registerRollValueCategorySuite(context);
            registerFacetsRollResultSuite(context);
            registerTierSuite(context);
        },
        {
            displayName: "Facets: Rolling Tests"
        }
    );
}
