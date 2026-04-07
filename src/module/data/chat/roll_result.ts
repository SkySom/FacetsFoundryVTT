import { FacetsBaseChatData } from "@data/chat/base";

type RollResultChatSchema = {
    formula: foundry.data.fields.StringField;
};

type RollResultBaseData = {
    formula2: string;
};

export class RollResultChatData<Schema extends RollResultChatSchema = RollResultChatSchema> extends FacetsBaseChatData<
    Schema,
    RollResultBaseData
> {
    static override defineSchema(): RollResultChatSchema {
        return {
            ...super.defineSchema(),
            formula: new foundry.data.fields.StringField()
        };
    }

    override prepareBaseData() {
        this.formula2 = "" + this.formula;
    }

    override async renderContent(): Promise<string> {
        return "<div>testing roll result</div>";
    }
}
