// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FacetsChatSchema = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FacetsChatBaseData = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FacetsChatDerivedData = {};

export class FacetsBaseChatData<
    Schema extends FacetsChatSchema = FacetsChatSchema,
    BaseData extends FacetsChatBaseData = FacetsChatBaseData,
    DerivedData extends FacetsChatDerivedData = FacetsChatDerivedData
> extends foundry.abstract.TypeDataModel<Schema, ChatMessage.Implementation, BaseData, DerivedData> {
    static override defineSchema(): FacetsChatSchema {
        return {};
    }

    async renderContent(): Promise<string> {
        return "<div>testing</div>";
    }
}
