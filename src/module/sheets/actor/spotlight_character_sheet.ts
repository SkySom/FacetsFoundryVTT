import type { ActorFacets } from "@actor";
import type { SpotlightCharacterData } from "@data/actor";
import { FacetsActorSheet, type FacetsActorRenderContext } from "./actor_sheet";

export class SpotlightCharacterActorSheet<
    RenderContext extends FacetsActorRenderContext = FacetsActorRenderContext,
    Configuration extends foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends FacetsActorSheet<SpotlightCharacterData, RenderContext, Configuration, RenderOptions> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["spotlightCharacter", ...(super.DEFAULT_OPTIONS.classes ?? [])]
    });

    static override PARTS = foundry.utils.mergeObject(
        {
            header: {
                template: "systems/facets/templates/actor/spotlight_character/header.hbs"
            }
        },
        super.DEFAULT_PARTS
    );

    override get actor(): ActorFacets<"spotlightCharacter"> {
        const superActor = super.actor;
        if (superActor.type === "spotlightCharacter") {
            return super.actor as ActorFacets<"spotlightCharacter">;
        } else {
            throw new Error("Actor is not a spotlight character?");
        }
    }

    override get system(): SpotlightCharacterData {
        return this.actor.system;
    }
}
