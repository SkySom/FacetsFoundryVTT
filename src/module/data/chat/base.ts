import { renderHandlebarsTemplate } from "@util";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FacetsChatSchema = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FacetsChatBaseData = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FacetsChatDerivedData = {};

export type ChatMetadata = {
    actions: Record<string, (PointerEvent, HTMLElement) => void>;
    template: string;
};

export class FacetsBaseChatData<
    Schema extends FacetsChatSchema = FacetsChatSchema,
    BaseData extends FacetsChatBaseData = FacetsChatBaseData,
    DerivedData extends FacetsChatDerivedData = FacetsChatDerivedData
> extends foundry.abstract.TypeDataModel<Schema, ChatMessage.Implementation, BaseData, DerivedData> {
    static override defineSchema(): FacetsChatSchema {
        return {};
    }

    static metadata: ChatMetadata = Object.freeze({
        actions: {},
        template: ""
    });

    get metadata(): ChatMetadata {
        type Type = {
            constructor: Type;
            metadata: ChatMetadata;
        } & typeof this;
        return (this as Type).constructor.metadata;
    }

    get template() {
        return this.metadata.template;
    }

    async _prepareContext() {
        return {};
    }

    async renderContent(element: Element): Promise<string> {
        const template = await this.renderTemplate();
        const click = this.#onClick.bind(this);
        element.addEventListener("click", click);
        return template;
    }

    async renderTemplate(): Promise<string> {
        if (!this.template) return "";
        return renderHandlebarsTemplate(this.template, await this._prepareContext());
    }

    /**
     * Handle click events within the card.
     * @param {PointerEvent} event  Triggering pointer event.
     */
    #onClick(event: PointerEvent) {
        if (event.target instanceof HTMLElement) {
            const target = event.target.closest("[data-action]");
            if (target instanceof HTMLElement) {
                const action = target.dataset.action || "";
                const handler = this.metadata.actions[action];
                if (handler) {
                    handler.call(this, event, target);
                } else {
                    this._onClickAction(event, target);
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onClickAction(_event: PointerEvent, _target: HTMLElement): void {}
}
