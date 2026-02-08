import type { Quench } from "@ethaks/fvtt-quench";
import { registerRollAutoCompleteSuite as registerRollAutocompleteSuite } from "./roll_autocomplete";

export function registerCommandBatch(quench: Quench) {
    quench.registerBatch(
        "facets.command.autocomplete",
        (context) => {
            registerRollAutocompleteSuite(context);
        },
        {
            displayName: "Facets: Autocomplete Tests"
        }
    )
}