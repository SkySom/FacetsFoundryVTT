import type { Quench } from "@ethaks/fvtt-quench";
import { registerLocaleSuite } from "./localize";

export function registerUtilBatch(quench: Quench) {
    quench.registerBatch(
        "facets.util",
        (context) => {
            registerLocaleSuite(context);
        },
        {
            displayName: "Facets: Util Tests"
        }
    )
}