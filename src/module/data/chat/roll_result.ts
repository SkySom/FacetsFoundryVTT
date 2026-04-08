import { FacetsBaseChatData, type ChatMetadata } from "@data/chat/base";
import { getRollTiers, RollTier } from "@roll/tier";
import { localize } from "@util";
import { format } from "../../util/localize";

type RollResultChatSchema = {
    formula: foundry.data.fields.StringField;
    total: foundry.data.fields.NumberField;
    result: foundry.data.fields.StringField;
    spentResources: foundry.data.fields.StringField;
    gainedResources: foundry.data.fields.StringField;
    enhanceable: foundry.data.fields.BooleanField;
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
            enhanceable: new foundry.data.fields.BooleanField()
        };
    }

    static override metadata: ChatMetadata = Object.freeze(
        foundry.utils.mergeObject(
            super.metadata,
            {
                actions: {},
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
            enhancer: this._gatherEnhancers()
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
                        text += " " + format("Roll.Extraordinary", { extraordinary: localize(`Roll.Tiers.${RollTier[tier]}`) });
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
}

type Enhancer = {
    add: number;
    newTier?: RollTier;
    text: string;
};
