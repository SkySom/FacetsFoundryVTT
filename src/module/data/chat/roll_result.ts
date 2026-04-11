import { PlayerCharacterData } from "@actor/data/player_character";
import { FacetsBaseChatData, type ChatMetadata, type FacetsChatSchema } from "@data/chat/base";
import { createRollResultSchema } from "@roll/facets_roll_result";
import { createRollResourceResultGroupSchema } from "@roll/roll_resource";
import { getRollTiers, RollTier } from "@roll/tier";
import { localize } from "@util";
import { format } from "../../util/localize";
import { gameUser } from "../../util/game_getters";

type RollResultChatSchema = FacetsChatSchema & ReturnType<typeof rollResultSchema>;

function rollResultSchema() {
    return {
        formula: new foundry.data.fields.StringField(),
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
        enhancedResult: new foundry.data.fields.StringField()
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
                    enhance: RollResultChatData.#enhanceRoll
                },
                template: "roll_result"
            },
            { inplace: false }
        )
    );

    override async _prepareContext() {
        const context = await super._prepareContext();

        return foundry.utils.mergeObject(context, {
            isAuthor: this.parent.author === gameUser(),
            formula: this.formula,
            result: this.result,
            spentResources: this.spentResources,
            gainedResources: this.gainedResources,
            enhanceable: this.enhanceable ?? true,
            enhancer: this._gatherEnhancers(),
            enhancedResult: this.enhancedResult ? JSON.parse(this.enhancedResult ?? "{}") : undefined
        });
    }

    _gatherEnhancers(): Enhancer[] {
        if (this.enhanceable) {
            const enhancers: Enhancer[] = [];
            for (let i = 1; i < 5; i++) {
                let tier: RollTier | undefined = undefined;
                let text = "+" + i;

                const oldTiers = getRollTiers((this.result.total ?? 0) + i - 1);
                const newTiers = getRollTiers((this.result.total ?? 0) + i);

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

    static async #enhanceRoll(this: RollResultChatData, _event: PointerEvent, element: HTMLElement): Promise<void> {
        if (this.parent.author == gameUser() && element.dataset.add) {
            const additional: number = parseInt(element.dataset.add);

            if (additional > 0) {
                const newTotal = (this.result.total ?? 0) + additional;
                const newTiers = getRollTiers(newTotal);

                const spent: { label: string; original: number; current: number }[] = [];
                if (this.parent.speakerActor?.system instanceof PlayerCharacterData) {
                    const actor = this.parent.speakerActor;
                    const system: PlayerCharacterData = this.parent.speakerActor.system;

                    spent.push({
                        label: localize("Roll.EnhancedTotal"),
                        original: this.result.total ?? 0,
                        current: newTotal
                    });
                    spent.push({
                        label: localize("Sheet.Generic.PlotPoints"),
                        original: system.plotPoints ?? 0,
                        current: (system.plotPoints ?? 0) - additional
                    });

                    //@ts-expect-error update types
                    await actor.update({ "system.plotPoints": (system.plotPoints ?? 0) - additional });
                }

                await this.parent.update({
                    //@ts-expect-error update types are weird?
                    "system.enhancedResult": JSON.stringify({ total: newTotal, tiers: newTiers, spent: spent }),
                    "system.enhanceable": false
                });
            }
        }
    }
}

type Enhancer = {
    add: number;
    newTier?: RollTier;
    text: string;
};
