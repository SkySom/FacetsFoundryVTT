import { FacetsBaseChatData, type ChatMetadata } from "@data/chat/base";
import { getRollTiers, RollTier } from "@roll/tier";
import { localize } from "@util";
import { format } from "../../util/localize";
import { PlayerCharacterData } from "@actor/data/player_character";

type RollResultChatSchema = {
    formula: foundry.data.fields.StringField;
    total: foundry.data.fields.NumberField;
    result: foundry.data.fields.StringField;
    spentResources: foundry.data.fields.StringField;
    gainedResources: foundry.data.fields.StringField;
    enhanceable: foundry.data.fields.BooleanField;
    enhancedResult: foundry.data.fields.StringField;
};

export class RollResultChatData<
    Schema extends RollResultChatSchema = RollResultChatSchema
> extends FacetsBaseChatData<Schema> {
    static override defineSchema(): RollResultChatSchema {
        return {
            ...super.defineSchema(),
            formula: new foundry.data.fields.StringField(),
            total: new foundry.data.fields.NumberField(),
            result: new foundry.data.fields.StringField(),
            spentResources: new foundry.data.fields.StringField(),
            gainedResources: new foundry.data.fields.StringField(),
            enhanceable: new foundry.data.fields.BooleanField(),
            enhancedResult: new foundry.data.fields.StringField()
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
            formula: this.formula,
            result: JSON.parse(this.result ?? "{}"),
            spentResources: JSON.parse(this.spentResources ?? "[]"),
            gainedResources: JSON.parse(this.gainedResources ?? "[]"),
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

                const oldTiers = getRollTiers((this.total ?? 0) + i - 1);
                const newTiers = getRollTiers((this.total ?? 0) + i);

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
        if (element.dataset.add) {
            const additional: number = parseInt(element.dataset.add);

            if (additional > 0) {
                const newTotal = (this.total ?? 0) + additional;
                const newTiers = getRollTiers(newTotal);

                const spent: { label: string; original: number; current: number }[] = [];
                if (this.parent.speakerActor?.system instanceof PlayerCharacterData) {
                    const actor = this.parent.speakerActor;
                    const system: PlayerCharacterData = this.parent.speakerActor.system;

                    spent.push({
                        label: localize("Roll.EnhancedTotal"),
                        original: this.total ?? 0,
                        current: newTotal
                    })
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
