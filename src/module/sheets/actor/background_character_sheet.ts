import type { ActorFacets } from "@actor";
import type { BackgroundCharacterData } from "@data/actor";
import { FacetsActorSheet, type FacetsActorRenderContext } from "./actor_sheet";

export class BackgroundCharacterActorSheet<
    RenderContext extends FacetsActorRenderContext = FacetsActorRenderContext,
    Configuration extends
        foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends FacetsActorSheet<BackgroundCharacterData, RenderContext, Configuration, RenderOptions> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["backgroundCharacter", ...(super.DEFAULT_OPTIONS.classes ?? [])]
    });

    static override PARTS = foundry.utils.mergeObject(
        {
            header: {
                template: "systems/facets/templates/actor/background_character/header.hbs"
            }
        },
        super.DEFAULT_PARTS
    );

    override get actor(): ActorFacets<"backgroundCharacter"> {
        const superActor = super.actor;
        if (superActor.type === "backgroundCharacter") {
            return super.actor as ActorFacets<"backgroundCharacter">;
        } else {
            throw new Error("Actor is not a background character?");
        }
    }

    override get system(): BackgroundCharacterData {
        return this.actor.system;
    }
}
