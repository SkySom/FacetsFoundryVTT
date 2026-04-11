import { rollResultMessage } from "@data/chat/roll_result";

export class FacetsCombat<SubType extends Combat.SubType> extends Combat<SubType> {
    override async rollInitiative(ids: string[], options?: Combat.InitiativeOptions): Promise<this> {
        const updates: { _id: string; initiative: number }[] = [];
        const messages: ChatMessage.CreateData[] = [];

        for (const id of ids) {
            const combatant = this.combatants.get(id);

            if (!combatant?.isOwner) continue;

            const initiativeRollResult = await combatant.getFacetsInitiativeRoll(options?.formula);
            const initiativePool = combatant.getInitiativePool();

            const flavor = game?.i18n?.format("COMBAT.RollsInitiative", {
                name: foundry.utils.escapeHTML(combatant?.name ?? "Nameless")
            });
            const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
                actor: combatant.actor,
                token: combatant.token,
                alias: combatant.name
            });
            if (initiativeRollResult) {
                updates.push({ _id: id, initiative: initiativeRollResult.total });
                const rollResultChatData = await rollResultMessage(
                    initiativePool.formula,
                    initiativeRollResult,
                    initiativePool.kept,
                    false
                );
                messages.push(
                    foundry.utils.mergeObject(rollResultChatData, {
                        speaker: speaker,
                        flags: {
                            core: {
                                initiativeRoll: true
                            }
                        },
                        system: {
                            flavor: flavor,
                            combatSource: {
                                combatantId: combatant.id,
                                combatId: this.id
                            }
                        }
                    })
                );
            } else {
                messages.push({
                    content: "Failed to roll Initiative",
                    speaker: speaker
                });
            }
        }

        if (!updates.length) return this;

        const updateOptions: { turnEvents: boolean; combatTurn?: number } = { turnEvents: false };
        if (!options?.updateTurn && this.turn) {
            updateOptions.combatTurn = this.turn;
        }
        await this.updateEmbeddedDocuments("Combatant", updates, updateOptions);
        await foundry.documents.ChatMessage.implementation.create(messages);
        return this;
    }
}
