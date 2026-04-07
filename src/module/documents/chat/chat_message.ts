import { FacetsBaseChatData } from "@data/chat/base";

export class FacetsChatMessage<SubType extends ChatMessage.SubType> extends ChatMessage<SubType> {
    
    constructor(data?: ChatMessage.CreateData, context?: ChatMessage.ConstructionContext) {
        super(data, context);
    }

    override async renderHTML(options?: ChatMessage.RenderHTMLOptions): Promise<HTMLElement> {
        const html = await super.renderHTML(options);

        if (this.system instanceof FacetsBaseChatData) {
            const contentEl = html.querySelector(".message-content");
            if (contentEl instanceof Element) {
                contentEl.innerHTML = await this.system.renderContent(contentEl);
            }
        }

        return html;
    }
}
