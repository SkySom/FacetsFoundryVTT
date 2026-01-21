import { FacetsActor } from "@actor";
import { FacetsRoll } from "../../module/dice/FacetsRoll";
import PlotDie from "../../module/dice/PlotDie";
import type { Listener } from "./hooks.interface";

export class Load implements Listener {
    listen(): void {
        console.log("Facets | Running Load");

        CONFIG.Actor.documentClass = FacetsActor;

        CONFIG.Dice.terms.pd = PlotDie;
        CONFIG.Dice.rolls.push(FacetsRoll);
    }
}
