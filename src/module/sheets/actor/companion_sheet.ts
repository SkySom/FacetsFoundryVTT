import type { ActorFacets } from "@actor";
import { FacetsActorSheet, type FacetsActorRenderContext } from "./actor_sheet";
import type { CompanionData } from "@data/actor/companion";

export class CompanionActorSheet<
    RenderContext extends FacetsActorRenderContext = FacetsActorRenderContext,
    Configuration extends
        foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends FacetsActorSheet<CompanionData, RenderContext, Configuration, RenderOptions> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["companionCharacter", ...(super.DEFAULT_OPTIONS.classes ?? [])]
    });

    static override PARTS = foundry.utils.mergeObject(
        {
            header: {
                template: "systems/facets/templates/actor/companion/header.hbs"
            }
        },
        super.DEFAULT_PARTS
    );

    override get actor(): ActorFacets<"companion"> {
        const superActor = super.actor;
        if (superActor.type === "companion") {
            return super.actor as ActorFacets<"companion">;
        } else {
            throw new Error("Actor is not a companion?");
        }
    }

    override get system(): CompanionData {
        return this.actor.system;
    }
}
