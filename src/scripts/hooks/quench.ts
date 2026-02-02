import { registerQuanch } from "../../unit_tests/unit_tests";
import type { Listener } from "./hooks.interface";

export class Quench implements Listener {
    listen(): void {
        console.log("Facets | Loading Quench Listener");
        Hooks.on("quenchReady", (quench) => {
            console.log("Facets | Registering Quench Tests");
            registerQuanch(quench);
        });
    }
}
