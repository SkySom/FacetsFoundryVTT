import { createFirstParty } from "@actor/helper";
import { Logger } from "../../module/util/logger";
import type { Listener } from "./hooks.interface";

export class Ready implements Listener {
    listen(): void {
        Hooks.once("ready", async () => {
            Logger.info("Running Ready");

            await createFirstParty();
        });
    }
}
