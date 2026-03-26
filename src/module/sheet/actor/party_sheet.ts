import type { ActorFacets } from "@actor";
import type { DeepPartial } from "fvtt-types/utils";

const ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

export interface PartyActorRenderContext extends foundry.applications.sheets.ActorSheetV2.RenderContext {
    user: User,
    owner: boolean;
    limited: boolean;
    actor: ActorFacets;
    system: ActorFacets["system"];
    flags: ActorFacets["flags"];
    members: ActorFacets[];
};

export class PartyActorSheet<
    RenderContext2 extends PartyActorRenderContext = PartyActorRenderContext,
    Configuration extends
        foundry.applications.sheets.ActorSheetV2.Configuration = foundry.applications.sheets.ActorSheetV2.Configuration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends foundry.applications.api.HandlebarsApplicationMixin(ActorSheetV2)<
    RenderContext2,
    Configuration,
    RenderOptions
> {
    static override DEFAULT_OPTIONS = {
        classes: ["actor", "party", "facets", "standard-form"],
        position: { height: 700, width: 700 },
        window: { resizable: true },
        actions: {
            toggleLock: PartyActorSheet.toggleLock
        }
    };

    static override PARTS = {
        header: {
            template: "systems/facets/templates/actor/party/header.hbs"
        },
        tabs: {
            template: "templates/generic/tab-navigation.hbs"
        },
        members: {
            template: "systems/facets/templates/actor/party/tab-members.hbs"
        },
        description: {
            template: "systems/facets/templates/actor/party/tab-description.hbs"
        }
    };

    static override TABS: Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration> = {
        primary: {
            tabs: [
                {
                    id: "members",
                    cssClass: "members",
                    label: "FACETS.Sheet.Actor.Party.Members.Header"
                },
                {
                    id: "description",
                    cssClass: "description",
                    label: "FACETS.Sheet.Actor.Party.Description.Header"
                }
            ],
            initial: "members"
        }
    };

    override async _prepareContext(
        options: DeepPartial<RenderOptions> & { isFirstRender: boolean }
    ): Promise<RenderContext2> {
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
            members: []
        };
        return {
            ...superContext,
            ...context
        };
    }

    override async _preparePartContext(partId, context) {
        switch (partId) {
            case "members":
            case "description":
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return context;
    }

    static toggleLock(this: PartyActorSheet<PartyActorRenderContext>) {
        if (!game.user!.isGM) return;
    }
}
