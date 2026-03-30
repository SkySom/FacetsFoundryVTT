import type { ActorFacets } from "@actor";
import type { DeepPartial } from "fvtt-types/utils";

const ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

export interface PlayerCharacterActorRenderContext extends foundry.applications.sheets.ActorSheetV2.RenderContext {
    user: User;
    owner: boolean;
    limited: boolean;
    actor: ActorFacets<"playerCharacter">;
    system: ActorFacets["system"];
    flags: ActorFacets["flags"];
    systemFields;
}

export class PlayerCharacterActorSheet<
    RenderContext extends PlayerCharacterActorRenderContext = PlayerCharacterActorRenderContext,
    Configuration extends
        foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends foundry.applications.api.HandlebarsApplicationMixin(ActorSheetV2)<
    RenderContext,
    Configuration,
    RenderOptions
> {
    override get actor(): ActorFacets<"playerCharacter"> {
        const superActor = super.actor;
        if (superActor.type === "playerCharacter") {
            // @ts-expect-error Can't force type???
            return super.actor;
        } else {
            throw new Error("Actor is not a pc?");
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: ["actor", "playerCharacter", "facets", "standard-form"],
        position: { height: 700, width: 700 },
        window: { resizable: true },
        actions: {},
        form: {
            submitOnChange: true
        }
    };

    static override PARTS = {
        header: {
            template: "systems/facets/templates/actor/player_character/header.hbs"
        },
        tabs: {
            template: "templates/generic/tab-navigation.hbs"
        },
        description: {
            template: "systems/facets/templates/actor/player_character/tab-description.hbs"
        }
    };

    static override TABS: Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration> = {
        primary: {
            tabs: [
                {
                    id: "description",
                    cssClass: "description",
                    label: "FACETS.Sheet.Generic.Description.Header"
                }
            ],
            initial: "description"
        }
    };

    override async _prepareContext(
        options: DeepPartial<RenderOptions> & { isFirstRender: boolean }
    ): Promise<RenderContext> {
        const superContext = super._prepareContext(options);
        const context = {
            tabs: this._prepareTabs("primary"),
            user: game?.user,
            editable: this.isEditable,
            owner: this.document.isOwner,
            limited: this.document.limited,
            actor: this.actor,
            system: this.actor.system,
            flags: this.actor.flags,
            // @ts-expect-error it thinks Document is unknown type??
            systemFields: this.document.system.schema.fields
        };
        return {
            ...superContext,
            ...context
        };
    }

    override async _preparePartContext(partId, context) {
        switch (partId) {
            case "description":
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return context;
    }
}
