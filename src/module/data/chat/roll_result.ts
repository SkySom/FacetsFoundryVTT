import { FacetsBaseChatData, type ChatMetadata } from "@data/chat/base";

type RollResultChatSchema = {
    formula: foundry.data.fields.StringField;
    result: foundry.data.fields.StringField;
};

export class RollResultChatData<
    Schema extends RollResultChatSchema = RollResultChatSchema
> extends FacetsBaseChatData<Schema> {
    static override defineSchema(): RollResultChatSchema {
        return {
            ...super.defineSchema(),
            formula: new foundry.data.fields.StringField(),
            result: new foundry.data.fields.StringField()
        };
    }

    static override metadata: ChatMetadata = Object.freeze(
        foundry.utils.mergeObject(
            super.metadata,
            {
                actions: {
                    
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
            result: JSON.parse(this.result ?? "{}")
        });
    }
}
