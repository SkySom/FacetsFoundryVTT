import type { Quench } from "@ethaks/fvtt-quench";
import { registerRollReaderSuite } from "./facets_roll_reader_tests";
import { registerRollTokenSuite } from "./token_tests";

export function registerRollBatch(quench: Quench) {
    quench.registerBatch(
        "facets.roll",
        (context) => {
            registerRollReaderSuite(context);
            registerRollTokenSuite(context);
        },
        {
            displayName: "Facets: Rolling Tests",
        },
    );
}
