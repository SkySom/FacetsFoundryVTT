import type { ActorFacets } from "@actor";
import type { PlayerCharacterData } from "@actor/data/player_character";
import { FacetsActorSheet, type FacetsActorRenderContext } from "./actor_sheet";

export class PlayerCharacterActorSheet<
    RenderContext extends FacetsActorRenderContext = FacetsActorRenderContext,
    Configuration extends
        foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends FacetsActorSheet<PlayerCharacterData, RenderContext, Configuration, RenderOptions> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["playerCharacter", ...(super.DEFAULT_OPTIONS.classes ?? [])]
    });

    static override PARTS = foundry.utils.mergeObject(
        {
            header: {
                template: "systems/facets/templates/actor/player_character/header.hbs"
            }
        },
        super.DEFAULT_PARTS
    );

    override get actor(): ActorFacets<"playerCharacter"> {
        const superActor = super.actor;
        if (superActor.type === "playerCharacter") {
            // @ts-expect-error Can't force type???
            return super.actor;
        } else {
            throw new Error("Actor is not a pc?");
        }
    }

    override get system(): PlayerCharacterData {
        return this.actor.system;
    }
}
