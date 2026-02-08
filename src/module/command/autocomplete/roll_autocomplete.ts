import { FacetsRollReader, RollReadSuggest, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { gameSettings } from "@util";
import {
    CommandAutocomplete,
    LocalizedInfoAutocomplete,
    LocalizedNoteAutocomplete,
    type Autocomplete
} from "./autocomplete_types";

export function getRollAutocomplete(
    alias: string,
    parameters: string,
    maxEntries: number,
    provideRecentRolls: () => string[] | null
): Autocomplete[] {
    const rollSettings: string[] | null = provideRecentRolls();

    let recentRolls: Autocomplete[];
    if (rollSettings != null) {
        recentRolls = rollSettings
            .slice()
            .filter((roll) => roll.includes(parameters))
            .map((r) => new CommandAutocomplete(alias, r));
    } else {
        recentRolls = [];
        gameSettings().set("facets", "recentRolls", new Array<string>());
    }

    const rollAutocompletes: Autocomplete[] = [];
    if (maxEntries > 5) {
        rollAutocompletes.push(new LocalizedInfoAutocomplete("Commands.RollInfo.Basic"));
        rollAutocompletes.push(new LocalizedInfoAutocomplete("Commands.RollInfo.DiceTypes"));
        if (recentRolls.length) {
            rollAutocompletes.push(new LocalizedNoteAutocomplete("Commands.RollInfo.Recent"));
        }
    }

    for (let i = 0; i < recentRolls.length && rollAutocompletes.length < maxEntries; i++) {
        rollAutocompletes.push(recentRolls[i]);
    }

    if (rollAutocompletes.length < maxEntries) {
        const rollReader = new FacetsRollReader(parameters);
        const rollRead: FacetsRollReadResult = rollReader.evaluate(true);

        if (rollRead instanceof RollReadSuggest) {
            if (rollAutocompletes.length > 0 || maxEntries > 5) {
                rollAutocompletes.push(new LocalizedNoteAutocomplete("Commands.RollInfo.Suggestion"));
            }
            for (const suggestion of rollRead.suggestions) {
                if (rollAutocompletes.length < maxEntries) {
                    rollAutocompletes.push(new CommandAutocomplete(alias, suggestion));
                }
            }
        }
    }

    return rollAutocompletes;
}
