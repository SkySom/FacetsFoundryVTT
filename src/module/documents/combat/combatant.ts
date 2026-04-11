import type { FacetsRollPool } from "@roll/facets_roll_data";
import { FacetsRollReader, RollReadSuccess } from "@roll/facets_roll_reader";
import type { FacetsRollResult } from "@roll/facets_roll_result";
import { FacetsRoller } from "@roll/facets_roller";
import { handleResourceSpendAndGain } from "@roll/roll_utils";
import { Logger } from "@util";

export class FacetsCombatant<SubType extends Combatant.SubType> extends Combatant<SubType> {
    override getInitiativeRoll(formula?: string): Roll.Implementation {
        Logger.error(
            "Tried to roll regular Initiative roll for " +
                (this.actor?.name ?? "no actor") +
                " with formula: " +
                formula,
            { toast: true }
        );

        formula = formula || "d6";
        const rollData = this.actor?.getRollData() || {};
        return Roll.create(formula, rollData);
    }

    override async rollInitiative(formula?: string): Promise<this> {
        const rollReadResult = this.getFacetsInitiativeRoll(formula);
        const initiativePool = this.getInitiativePool(formula);
        if (rollReadResult instanceof RollReadSuccess) {
            const rollResult = await FacetsRoller.fromTokens(rollReadResult.rollTokens).getResults({
                kept: initiativePool.kept
            });
            await handleResourceSpendAndGain(rollResult, false);
            return (await this.update({ initiative: rollResult.total })) || this;
        } else {
            Logger.error("Failed to roll initiative for " + this.actor?.name, { toast: true });
            return this;
        }
    }

    getInitiativePool(formula?: string | null): FacetsRollPool {
        return formula
            ? { formula: formula, kept: 2 }
            : this.actor?.getFacetsRollPools()["initiative"] || { formula: "2d6", kept: 2 };
    }

    async getFacetsInitiativeRoll(formula?: string | null): Promise<FacetsRollResult | undefined> {
        const initiativePool = this.getInitiativePool(formula);

        const rollReadResult = new FacetsRollReader(initiativePool.formula).evaluate();
        if (rollReadResult instanceof RollReadSuccess) {
            return await FacetsRoller.fromTokens(rollReadResult.rollTokens).getResults({ kept: initiativePool.kept });
        } else {
            return undefined;
        }
    }
}
