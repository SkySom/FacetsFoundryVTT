import { FacetsBaseChatData } from "@data/chat/base";

export class FacetsChatMessage<SubType extends ChatMessage.SubType> extends ChatMessage<SubType> {
    constructor(data?: ChatMessage.CreateData, context?: ChatMessage.ConstructionContext) {
        super(data, context);
    }

    override async renderHTML(options?: ChatMessage.RenderHTMLOptions): Promise<HTMLElement> {
        const html = await super.renderHTML(options);

        if (this.system instanceof FacetsBaseChatData) {
            const contentEl = html.querySelector(".message-content");
            if (contentEl) {
                contentEl.innerHTML = await this.system.renderContent();
            }
            html.addEventListener("click", (ev: PointerEvent) => {
                const dataElement = ev.target?.closest("[data-action]");
                if (!dataElement) return;

                const action = this.actions[dataElement.dataset.action];
                if (action) {
                    action.bind(document)(ev, element);
                }
            });
        }

        return html;
    }

    get actions(): Record<string, Function>
}
