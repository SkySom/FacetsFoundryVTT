import { PartyData } from "@actor/data/party";
import { PlayerCharacterData } from "@actor/data/player_character";
import { FacetsBaseChatData, type ChatMetadata, type FacetsChatSchema } from "@data/chat/base";
import { FacetsCombat } from "@documents/combat/combat";
import { FacetsCombatant } from "@documents/combat/combatant";
import { FacetsRollReader, RollReadSuccess } from "@roll/facets_roll_reader";
import { createRollResultSchema, FacetsRollResult } from "@roll/facets_roll_result";
import { FacetsRoller } from "@roll/facets_roller";
import {
    createActorResourceChangeSchema,
    createRollResourceResultGroupSchema,
    doom,
    plotPoints
} from "@roll/roll_resource";
import { handleResourceSpendAndGain } from "@roll/roll_utils";
import { createTierResultSchema, getRollTiers, RollTier } from "@roll/tier";
import { localize, Logger } from "@util";
import { gameActors, gameSettings, gameUser } from "../../util/game_getters";
import { format } from "../../util/localize";

type RollResultChatSchema = FacetsChatSchema & ReturnType<typeof rollResultSchema>;

function rollResultSchema() {
    return {
        flavor: new foundry.data.fields.StringField({
            required: false,
            nullable: true
        }),
        formula: new foundry.data.fields.StringField(),
        kept: new foundry.data.fields.NumberField({
            initial: 2,
            integer: true,
            nullable: false,
            positive: true
        }),
        test: new foundry.data.fields.BooleanField(),
        result: new foundry.data.fields.SchemaField(createRollResultSchema(), { label: "FACETS.Fields.Result" }),
        spentResources: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createRollResourceResultGroupSchema()),
            {
                label: "FACETS.Fields.SpentResources"
            }
        ),
        gainedResources: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createRollResourceResultGroupSchema()),
            {
                label: "FACETS.Fields.GainedResources"
            }
        ),
        enhanceable: new foundry.data.fields.BooleanField(),
        enhancedResult: new foundry.data.fields.SchemaField(
            {
                total: new foundry.data.fields.NumberField({
                    initial: 0,
                    integer: true,
                    nullable: false
                }),
                tiers: new foundry.data.fields.SchemaField(createTierResultSchema()),
                spent: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        label: new foundry.data.fields.StringField(),
                        original: new foundry.data.fields.NumberField({
                            initial: 0,
                            integer: true,
                            nullable: false
                        }),
                        current: new foundry.data.fields.NumberField({
                            initial: 0,
                            integer: true,
                            nullable: false
                        })
                    })
                )
            },
            {
                initial: null,
                nullable: true,
                required: false
            }
        ),
        actorResourceChanges: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createActorResourceChangeSchema())
        ),
        canReroll: new foundry.data.fields.BooleanField({
            initial: true,
            nullable: false
        }),
        rerolledResult: new foundry.data.fields.SchemaField(createRollResultSchema(), {
            label: "FACETS.Fields.RerolledResult",
            nullable: true,
            required: false
        }),
        combatSource: new foundry.data.fields.SchemaField(
            {
                combatId: new foundry.data.fields.ForeignDocumentField(FacetsCombat, {
                    idOnly: true,
                    nullable: false,
                    required: true
                }),
                combatantId: new foundry.data.fields.ForeignDocumentField(FacetsCombatant, {
                    idOnly: true,
                    nullable: false,
                    required: true
                })
            },
            {
                nullable: true,
                required: false
            }
        )
    };
}

export class RollResultChatData<
    Schema extends RollResultChatSchema = RollResultChatSchema
> extends FacetsBaseChatData<Schema> {
    static override defineSchema(): RollResultChatSchema {
        return {
            ...super.defineSchema(),
            ...rollResultSchema()
        };
    }

    static override metadata: ChatMetadata = Object.freeze(
        foundry.utils.mergeObject(
            super.metadata,
            {
                actions: {
                    enhance: RollResultChatData.#enhanceRoll,
                    reroll: RollResultChatData.#reroll
                },
                template: "roll_result"
            },
            { inplace: false }
        )
    );

    override async _prepareContext() {
        const context = await super._prepareContext();

        let isAuthor = this.parent.author === gameUser();

        const combatActor = this.combatant?.actor;

        if (combatActor?.type === "playerCharacter") {
            isAuthor = gameUser().character == combatActor;
        }

        return foundry.utils.mergeObject(context, {
            isAuthor: isAuthor,
            flavor: this.flavor,
            formula: this.formula,
            result: this.result,
            spentResources: this.spentResources,
            gainedResources: this.gainedResources,
            enhanceable: this.enhanceable ?? true,
            enhancer: this._gatherEnhancers(),
            enhancedResult: this.enhancedResult,
            canReroll: this.canReroll,
            rerolledResult: this.rerolledResult
        });
    }

    _gatherEnhancers(): Enhancer[] {
        if (this.enhanceable) {
            const enhancers: Enhancer[] = [];

            const total = (this.rerolledResult ? this.rerolledResult.total : this.result.total) ?? 0;

            for (let i = 1; i < 5; i++) {
                let tier: RollTier | undefined = undefined;
                let text = "+" + i;

                const oldTiers = getRollTiers(total + i - 1);
                const newTiers = getRollTiers(total + i);

                if (oldTiers.regular != newTiers.regular) {
                    tier = newTiers.regular;
                    text += " " + localize(`Roll.Tiers.${RollTier[tier]}`);
                } else if (oldTiers.extraordinary != newTiers.extraordinary) {
                    tier = newTiers.extraordinary;
                    if (tier) {
                        text +=
                            " " +
                            format("Roll.Extraordinary", { extraordinary: localize(`Roll.Tiers.${RollTier[tier]}`) });
                    }
                }

                enhancers.push({
                    add: i,
                    newTier: tier,
                    text: text
                });
            }
            return enhancers;
        } else {
            return [];
        }
    }

    get combat(): FacetsCombat<Combat.SubType> | undefined {
        if (this.combatSource) {
            return game.combats?.get(this.combatSource.combatId + "") as FacetsCombat<Combat.SubType>;
        }
        return undefined;
    }

    get combatant(): FacetsCombatant<Combatant.SubType> | undefined {
        const combat = this.combat;
        if (combat && this.combatSource) {
            return combat.combatants.get(this.combatSource.combatantId + "");
        }

        return undefined;
    }

    static async #enhanceRoll(this: RollResultChatData, _event: PointerEvent, element: HTMLElement): Promise<void> {
        if (this.parent.author == gameUser() && element.dataset.add) {
            const additional: number = parseInt(element.dataset.add);

            const total = (this.rerolledResult ? this.rerolledResult.total : this.result.total) ?? 0;
            if (additional > 0) {
                const newTotal = total + additional;
                const newTiers = getRollTiers(newTotal);

                const spent: { label: string; original: number; current: number }[] = [];

                if (this.parent.speakerActor?.system instanceof PlayerCharacterData) {
                    const actor = this.parent.speakerActor;
                    const system: PlayerCharacterData = this.parent.speakerActor.system;

                    spent.push({
                        label: localize("Roll.EnhancedTotal"),
                        original: total,
                        current: newTotal
                    });
                    spent.push({
                        label: localize("Sheet.Generic.PlotPoints"),
                        original: system.plotPoints ?? 0,
                        current: (system.plotPoints ?? 0) - additional
                    });

                    //@ts-expect-error update types
                    await actor.update({ "system.plotPoints": (system.plotPoints ?? 0) - additional });
                } else if (gameUser().isActiveGM) {
                    const activeParty = gameActors().get(gameSettings().get("facets", "activeParty"));
                    if (activeParty.system instanceof PartyData) {
                        spent.push({
                            label: localize("Roll.EnhancedTotal"),
                            original: total,
                            current: newTotal
                        });
                        spent.push({
                            label: localize("Sheet.Generic.Doom"),
                            original: activeParty.system.doom ?? 0,
                            current: (activeParty.system.doom ?? 0) - additional
                        });

                        await activeParty.update({
                            //@ts-expect-error update types
                            "system.doom": (activeParty.system.doom ?? 0) - additional
                        });
                    }
                }

                await this.parent.update({
                    //@ts-expect-error update types are weird?
                    "system.enhancedResult": { total: newTotal, tiers: newTiers.toSchema(), spent: spent },
                    "system.enhanceable": false,
                    "system.canReroll": false
                });

                if (this.combatant) {
                    await this.combatant.update({ initiative: newTotal });
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async #reroll(this: RollResultChatData, _event: PointerEvent, _element: HTMLElement): Promise<void> {
        for (const actorResourceChange of this.actorResourceChanges) {
            try {
                const actor = fromUuidSync<Actor>(actorResourceChange.actor);
                if (actor) {
                    if (actorResourceChange.resource === doom && actor.system instanceof PartyData) {
                        // @ts-expect-error update types
                        await actor.update({
                            "system.doom": (actor.system.doom ?? 0) - (actorResourceChange.change ?? 0)
                        });
                    }
                    if (actorResourceChange.resource === plotPoints && actor.system instanceof PlayerCharacterData) {
                        // @ts-expect-error update types
                        await actor.update({
                            "system.plotPoints": (actor.system.plotPoints ?? 0) - (actorResourceChange.change ?? 0)
                        });
                    }
                } else {
                    Logger.error("Failed to find Actor during reroll ", { toast: true });
                }
            } catch (error) {
                Logger.error("Failed to find Actor during reroll " + error);
            }
        }

        const rerolledResult = new FacetsRollReader(this.formula ?? "").evaluate();

        if (rerolledResult instanceof RollReadSuccess) {
            const result = await FacetsRoller.fromTokens(rerolledResult.rollTokens).getResults({
                kept: this.kept ?? 2
            });

            const resourceResultGroups = await handleResourceSpendAndGain(result, this.test ?? false);

            await this.parent.update({
                //@ts-expect-error update types
                "system.rerolledResult": result.toSchema(),
                "system.spentResources": resourceResultGroups.spentResources.map((resources) => resources.toSchema()),
                "system.gainedResources": resourceResultGroups.gainedResources.map((resources) => resources.toSchema()),
                "system.actorResourceChanges": resourceResultGroups.actorResourceChanges.map((changes) =>
                    changes.toSchema()
                ),
                "system.canReroll": false
            });

            if (this.combatant) {
                await this.combatant.update({ initiative: result.total });
            }
        } else {
            Logger.error("Failed to read " + this.formula + " and got " + JSON.stringify(rerolledResult), {
                toast: true
            });
        }
    }
}

export async function rollResultMessage(
    formula: string,
    result: FacetsRollResult,
    kept: number,
    test: boolean
): Promise<Partial<ChatMessage.CreateData>> {
    const resourceResultGroups = await handleResourceSpendAndGain(result, test);

    return {
        type: "rollResult",
        system: {
            formula: formula,
            kept: kept,
            result: result.toSchema(),
            spentResources: resourceResultGroups.spentResources.map((resources) => resources.toSchema()),
            gainedResources: resourceResultGroups.gainedResources.map((resources) => resources.toSchema()),
            enhanceable: resourceResultGroups.enhanceable,
            actorResourceChanges: resourceResultGroups.actorResourceChanges.map((changes) => changes.toSchema())
        }
    };
}

type Enhancer = {
    add: number;
    newTier?: RollTier;
    text: string;
};
