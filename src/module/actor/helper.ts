import { ActorFacets } from "@actor";
import { gameSettings } from "@util";
import { gameActors, gameUser } from "../util/game_getters";

/** Create the first party actor in this (typically new) world */
async function createFirstParty(): Promise<void> {
    if (!gameUser().isActiveGM || gameSettings().get("facets", "createdFirstParty")) {
        return;
    }

    if (!gameActors().some((a) => a.type === "party")) {
        await ActorFacets.create(
            {
                type: "party",
                name: "First Party"
            },
            { keepId: true }
        );
        await gameSettings().set("facets", "activeParty", "xxxFacetsxxxFirstPartyxxx");
    }

    await gameSettings().set("facets", "createdFirstParty", true);
}

export { createFirstParty };

