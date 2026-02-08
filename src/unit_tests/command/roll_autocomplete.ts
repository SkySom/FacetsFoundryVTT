import {
    CommandAutocomplete,
    LocalizedInfoAutocomplete,
    LocalizedNoteAutocomplete
} from "@command/autocomplete/autocomplete_types";
import { getRollAutocomplete } from "@command/autocomplete/roll_autocomplete";
import type { QuenchBatchContext } from "@ethaks/fvtt-quench";

export function registerRollAutoCompleteSuite(context: QuenchBatchContext) {
    const { describe, it, expect } = context;

    describe("Roll Autocomplete", function () {
        it("Should not include extra info if maxEntries not > 5", function () {
            const autocompletes = getRollAutocomplete("r", "d6 d", 5, () => null);

            expect(autocompletes).to.not.deep.include(new LocalizedInfoAutocomplete("Commands.RollInfo.Basic"));
            expect(autocompletes).to.not.deep.include(new LocalizedInfoAutocomplete("Commands.RollInfo.DiceTypes"));
        });

        it("Should include extra info if maxEntries > 5", function () {
            const autocompletes = getRollAutocomplete("r", "d6 d", 6, () => null);

            expect(autocompletes).to.deep.include(new LocalizedInfoAutocomplete("Commands.RollInfo.Basic"));
            expect(autocompletes).to.deep.include(new LocalizedInfoAutocomplete("Commands.RollInfo.DiceTypes"));
        });

        it("Should include extra recent rolls info if greater than 5 max entries and valid recent rolls", function () {
            const provideRecentRolls = () => ["d6 d6 +1", "d6 d6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 d", 6, provideRecentRolls);

            expect(autocompletes).to.deep.include.members([
                new LocalizedInfoAutocomplete("Commands.RollInfo.Basic"),
                new LocalizedInfoAutocomplete("Commands.RollInfo.DiceTypes"),
                new LocalizedNoteAutocomplete("Commands.RollInfo.Recent")
            ]);
        });

        it("Should only include recent rolls info that match", function () {
            const provideRecentRolls = () => ["d6 ad6 +1", "d6 cd6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 d6", 6, provideRecentRolls);

            expect(autocompletes.slice(3, 6)).to.deep.include.members([
                new CommandAutocomplete("r", "d6 d6 +3"),
                new CommandAutocomplete("r", "d6 d6 +4"),
                new CommandAutocomplete("r", "d6 d6 +5")
            ]);

            expect(autocompletes).to.not.deep.include.members([
                new CommandAutocomplete("r", "d6 ad6 +1"),
                new CommandAutocomplete("r", "d6 cd6 +2")
            ]);
        });

        it("Should not include suggestions if no room", function () {
            const provideRecentRolls = () => ["d6 ad6 +1", "d6 cd6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 d", 6, provideRecentRolls);

            expect(autocompletes.slice(2, 6)).to.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Recent"),
                new CommandAutocomplete("r", "d6 d6 +3"),
                new CommandAutocomplete("r", "d6 d6 +4"),
                new CommandAutocomplete("r", "d6 d6 +5")
            ]);

            expect(autocompletes).to.not.deep.include.members([
                new CommandAutocomplete("r", "d6 d12"),
                new CommandAutocomplete("r", "d6 d10"),
                new CommandAutocomplete("r", "d6 d8"),
                new CommandAutocomplete("r", "d6 d6"),
                new CommandAutocomplete("r", "d6 d4")
            ]);
        });

        it("Should include suggestions if there is room", function () {
            const provideRecentRolls = () => ["d6 ad6 +1", "d6 cd6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 d", 10, provideRecentRolls);

            expect(autocompletes.slice(2, 6)).to.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Recent"),
                new CommandAutocomplete("r", "d6 d6 +3"),
                new CommandAutocomplete("r", "d6 d6 +4"),
                new CommandAutocomplete("r", "d6 d6 +5")
            ]);

            expect(autocompletes.slice(6)).to.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Suggestion"),
                new CommandAutocomplete("r", "d6 d12"),
                new CommandAutocomplete("r", "d6 d10"),
                new CommandAutocomplete("r", "d6 d8")
            ]);

            expect(autocompletes).to.not.deep.include.members([
                new CommandAutocomplete("r", "d6 d6"),
                new CommandAutocomplete("r", "d6 d4")
            ]);
        });

        it("Should skip recent rolls if none match", function () {
            const provideRecentRolls = () => ["d6 ad6 +1", "d6 cd6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 kd", 10, provideRecentRolls);

            expect(autocompletes).to.not.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Recent")
            ]);

            expect(autocompletes.slice(2)).to.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Suggestion"),
                new CommandAutocomplete("r", "d6 kd12"),
                new CommandAutocomplete("r", "d6 kd10"),
                new CommandAutocomplete("r", "d6 kd8"),
                new CommandAutocomplete("r", "d6 kd6"),
                new CommandAutocomplete("r", "d6 kd4")
            ]);
        });

        it("Should return less than max entries if no additional options", function () {
            const provideRecentRolls = () => ["d6 ad6 +1", "d6 cd6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 kd1", 10, provideRecentRolls);

            expect(autocompletes).to.not.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Recent")
            ]);

            expect(autocompletes.slice(2)).to.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Suggestion"),
                new CommandAutocomplete("r", "d6 kd12"),
                new CommandAutocomplete("r", "d6 kd10")
            ]);
        });

        it("Should return not include suggestions if there are none", function () {
            const provideRecentRolls = () => ["d6 ad6 +1", "d6 cd6 +2", "d6 d6 +3", "d6 d6 +4", "d6 d6 +5"];

            const autocompletes = getRollAutocomplete("r", "d6 kd12", 10, provideRecentRolls);

            expect(autocompletes).to.not.deep.include.members([
                new LocalizedNoteAutocomplete("Commands.RollInfo.Recent"),
                new LocalizedNoteAutocomplete("Commands.RollInfo.Suggestion")
            ]);

            expect(autocompletes).lengthOf(2);
        });
    });
}
