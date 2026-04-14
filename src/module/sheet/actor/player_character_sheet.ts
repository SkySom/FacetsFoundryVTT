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
        actions: {
            createPool: PlayerCharacterActorSheet.#createPool,
            deletePool: PlayerCharacterActorSheet.#deletePool
        },
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
        },
        pools: {
            template: "systems/facets/templates/actor/player_character/tab-pools.hbs"
        }
    };

    static override TABS: Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration> = {
        primary: {
            tabs: [
                {
                    id: "description",
                    cssClass: "description",
                    label: "FACETS.Sheet.Generic.Description.Header"
                },
                {
                    id: "pools",
                    cssClass: "pools",
                    label: "FACETS.Sheet.Tab.Pools.Header"
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
            systemFields: this.document.system.schema.fields,
            pools: this.actor.system.pools
        };
        return {
            ...superContext,
            ...context
        };
    }

    override async _preparePartContext(partId, context) {
        switch (partId) {
            case "description":
            case "pools":
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return context;
    }

    protected override _prepareSubmitData(
        event: SubmitEvent,
        form: HTMLFormElement,
        formData: FormDataExtended,
        updateData?: unknown
    ): object {
        //@ts-expect-error magical errors?
        const { poolFields, ...submitData } = this._processFormData(event, form, formData);
        if (poolFields) {
            const poolsToUpdate: object[] = [];
            if (poolFields instanceof Object) {
                for (const id of Object.keys(poolFields)) {
                    const submittedPool = poolFields[id];
                    poolsToUpdate.push({
                        id: id,
                        name: submittedPool["name"],
                        keptDice: submittedPool["keptDice"],
                        formula: submittedPool["formula"],
                        standard: submittedPool["standard"]
                    });
                }
            }
            if (submitData["system"]) {
                submitData["system"]["pools"] = poolsToUpdate;
            } else {
                submitData["system"] = {
                    pools: poolsToUpdate
                };
            }
        }
        if (updateData) {
            foundry.utils.mergeObject(submitData, updateData, { performDeletions: true });
            foundry.utils.mergeObject(submitData, updateData, { performDeletions: false });
        }
        this.document.validate({ changes: submitData, clean: true, fallback: false });
        return submitData;
    }

    static #createPool(this: PlayerCharacterActorSheet): void {
        const pools = this.actor.system.pools;

        pools.push({
            id: crypto.randomUUID().toString(),
            name: "Name",
            keptDice: 2,
            formula: "2d6",
            standard: false
        });

        this.actor.update({
            // @ts-expect-error update types
            "system.pools": pools
        });
    }

    static #deletePool(this: PlayerCharacterActorSheet, _event: PointerEvent, target: HTMLElement): void {
        if (target.dataset.id) {
            const pools = this.actor.system.pools;

            this.actor.update({
                // @ts-expect-error update types
                "system.pools": pools.filter((pool) => pool.id !== target.dataset.id)
            });
        }
    }
}
