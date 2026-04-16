import type { ActorFacets } from "@actor";
import { FacetsActorSheet, type FacetsActorRenderContext } from "./actor_sheet";
import type { ForegroundCharacterData } from "@data/actor";

export class ForegroundCharacterActorSheet<
    RenderContext extends FacetsActorRenderContext = FacetsActorRenderContext,
    Configuration extends
        foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends FacetsActorSheet<ForegroundCharacterData, RenderContext, Configuration, RenderOptions> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["foregroundCharacter", ...(super.DEFAULT_OPTIONS.classes ?? [])]
    });

    static override PARTS = foundry.utils.mergeObject(
        {
            header: {
                template: "systems/facets/templates/actor/foreground_character/header.hbs"
            }
        },
        super.DEFAULT_PARTS
    );

    override get actor(): ActorFacets<"foregroundCharacter"> {
        const superActor = super.actor;
        if (superActor.type === "foregroundCharacter") {
            return super.actor as ActorFacets<"foregroundCharacter">;
        } else {
            throw new Error("Actor is not a foreground character?");
        }
    }

    override get system(): ForegroundCharacterData {
        return this.actor.system;
    }
}
