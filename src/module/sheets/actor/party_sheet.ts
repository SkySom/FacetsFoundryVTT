import { ActorFacets } from "@actor";
import type { PartyData } from "@data/actor/party";
import { gameSettings, localize } from "@util";
import type { DeepPartial } from "fvtt-types/utils";
import { format, localizeFoundry } from "../../util/localize";
import { Logger } from "../../util/logger";
import { FacetsActorSheet, type FacetsActorRenderContext } from "./actor_sheet";

export interface PartyActorRenderContext extends FacetsActorRenderContext {
    members: RenderedMember[];
}

export interface PartyActorConfiguration extends foundry.applications.sheets.ActorSheetV2.Configuration {
    dragDrop: foundry.applications.ux.DragDrop.Configuration[];
}

export class PartyActorSheet<
    RenderContext extends PartyActorRenderContext = PartyActorRenderContext,
    Configuration extends PartyActorConfiguration = PartyActorConfiguration,
    RenderOptions extends
        foundry.applications.sheets.ActorSheetV2.RenderOptions = foundry.applications.sheets.ActorSheetV2.RenderOptions
> extends FacetsActorSheet<PartyData, RenderContext, Configuration, RenderOptions> {
    override get actor(): ActorFacets<"party"> {
        const superActor = super.actor;
        if (superActor.type === "party") {
            // @ts-expect-error Can't force type???
            return super.actor;
        } else {
            throw new Error("Actor is not a party?");
        }
    }

    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
        {
            classes: ["party", ...super.DEFAULT_OPTIONS.classes],
            actions: {
                toggleLock: PartyActorSheet.toggleLock,
                deleteMember: PartyActorSheet.deleteMember,
                openMember: PartyActorSheet.openMember,
                showMemberImage: PartyActorSheet.showMemberImage,
                setActiveParty: PartyActorSheet.setActiveParty
            }
        },
        super.DEFAULT_OPTIONS,
        { recursive: true }
    );

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
            template: "systems/facets/templates/actor/base/tab-description.hbs"
        },
        pools: {
            template: "systems/facets/templates/actor/base/tab-pools.hbs"
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
                    label: "FACETS.Sheet.Tab.Description.Header"
                },
                {
                    id: "pools",
                    cssClass: "pools",
                    label: "FACETS.Sheet.Tab.Pools.Header"
                }
            ],
            initial: "members"
        }
    };

    #dragDrop: foundry.applications.ux.DragDrop[];

    get dragDrop() {
        return this.#dragDrop;
    }

    constructor(options) {
        super(options);
        this.#dragDrop = this.#createDragDropHandlers();
    }

    override get system(): PartyData {
        return this.actor.system;
    }

    override async _prepareContext(
        options: DeepPartial<RenderOptions> & { isFirstRender: boolean }
    ): Promise<RenderContext> {
        const superContext = await super._prepareContext(options);
        const context = {
            members: this._prepareMembers(),
            unlocked: !this.actor.system.locked,
            activeParty: this.actor.id === gameSettings().get("facets", "activeParty")
        };
        return {
            ...superContext,
            ...context
        };
    }

    override async _preparePartContext(partId, context) {
        switch (partId) {
            case "members":
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return super._preparePartContext(partId, context);
    }

    static setActiveParty(this: PartyActorSheet<PartyActorRenderContext>) {
        if (this.actor.id) {
            gameSettings().set("facets", "activeParty", this.actor.id);
            this.render({ force: true });
        }
    }

    static toggleLock(this: PartyActorSheet<PartyActorRenderContext>) {
        if (!game.user!.isGM) return;
        // @ts-expect-error types are weird?
        this.actor.update({ "system.locked": !this.actor.system.locked });
    }

    static async deleteMember(this: PartyActorSheet, _event: PointerEvent, target: HTMLElement) {
        const id = target.closest<HTMLElement>("[data-member-uuid]")?.dataset.memberUuid;
        if (!id) return;
        if (!this.actor.system.members.has(id)) return;
        const existing = Array.from(this.actor.system.members.keys()).map((v) => v.toString());
        const index = existing.indexOf(id);
        if (index < 0) return;
        const member = this.actor.system.members.get(id)?.actor;
        const name = member ? member.name : id;
        const type = game?.i18n?.localize("DOCUMENT.Actor");
        const proceed = await foundry.applications.api.DialogV2.confirm({
            rejectClose: false,
            window: {
                title: `${game?.i18n?.format("DOCUMENT.Delete", { type: type ?? "" })}: ${name}`
            },
            content: `<h3>${game?.i18n?.localize("AreYouSure")}</h3><p>${format("DeleteFromParentWarning", { name, parent: this.actor.name })}</p>`
        });
        if (!proceed) return;
        existing.splice(index, 1);
        // @ts-expect-error Update Types Weird
        await this.actor.update({ "system.memberList": existing });
    }

    static openMember(this: PartyActorSheet, _event: PointerEvent, target: HTMLElement) {
        const id = target.closest<HTMLElement>("[data-member-uuid]")?.dataset.memberUuid;
        if (!id) return;
        this.actor.system.members.get(id)?.actor?.sheet?.render(true);
    }

    static showMemberImage(this: PartyActorSheet, _event: PointerEvent, target: HTMLElement) {
        const id = target.closest<HTMLElement>("[data-member-uuid]")?.dataset.memberUuid;
        if (!id) return;
        const actor = this.actor.system.members.get(id)?.actor;
        if (!actor) return;
        new foundry.applications.apps.ImagePopout({
            src: actor.img ?? "",
            uuid: actor.uuid,
            window: { title: actor.name }
        }).render({ force: true });
    }

    protected _canDragStart(): boolean {
        return this.isEditable;
    }

    protected _canDragDrop(): boolean {
        return this.isEditable;
    }

    protected _onDragStart(event: DragEvent) {
        const docRow = (event.currentTarget as HTMLElement).closest("li");
        if ("link" in (event.target as HTMLElement).dataset) return;

        if (!docRow) return;

        // Chained operation
        const dragData = this._getEmbeddedDocument(docRow)?.toDragData();

        if (!dragData) return;

        // Set data transfer
        event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _onDragOver(_event: DragEvent) {}

    protected _getEmbeddedDocument(target: HTMLElement): Item | ActiveEffect | void {
        const docRow = target.closest<HTMLLIElement>("li[data-document-class]");
        if (!docRow) return;
        // TODO: Once `this.document` correctly resolves this will throw more type errors
        if (docRow.dataset.documentClass === "Item") {
            const item = this.document.items.get(docRow.dataset.itemId ?? "");
            if (item != undefined) {
                return item;
            } else {
                return console.warn("No item found for itemId " + docRow.dataset.itemId);
            }
        } else if (docRow.dataset.documentClass === "ActiveEffect") {
            const parentId = docRow.dataset.parentId;
            const parent =
                parentId && parentId !== this.document.id ? this.document.items.get(parentId) : this.document;
            const effect = parent?.effects.get(docRow?.dataset.effectId ?? "");
            if (effect != undefined) {
                return effect;
            } else {
                return console.warn("Could not find document for ");
            }
        } else return console.warn("Could not find document class");
    }

    protected async _onDrop(event: DragEvent) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event) as object;

        if (data["type"] === "Actor") {
            this._onDropActor(event, data);
        }
    }

    protected async _onDropActor(_event: DragEvent, data: object): Promise<object | boolean> {
        if (!this.actor.isOwner || this.actor.system.locked) return false;

        const actor = await getDocumentClass("Actor").fromDropData(data);
        if (actor != undefined) {
            if (actor.type !== "playerCharacter") {
                Logger.warn(`You cannot add ${localize("TYPES.Actor." + actor.type) ?? "ERROR"} Actors to a group!`, {
                    toast: true,
                    localize: false
                });
                return false;
            }

            Logger.info("Added " + actor.name);
            // @ts-expect-error types are weird?
            this.actor.update({ "system.memberList": [...this.actor.system._source.memberList, actor.uuid] });
            return true;
        }
        return false;
    }

    #createDragDropHandlers(): foundry.applications.ux.DragDrop[] {
        return (this.options.dragDrop ?? []).map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            };
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            };
            return new foundry.applications.ux.DragDrop.implementation(d);
        });
    }

    _prepareMembers(): RenderedMember[] {
        const members: RenderedMember[] = [];

        for (const [uuid, member] of this.actor.system.members) {
            members.push({
                uuid: uuid,
                name: member.actor?.name ?? localizeFoundry("Unknown"),
                img: member.actor?.img ?? "/icons/svg/mystery-man.svg"
            });
        }
        return members;
    }
}

interface RenderedMember {
    uuid: string;
    name: string;
    img: string;
}
