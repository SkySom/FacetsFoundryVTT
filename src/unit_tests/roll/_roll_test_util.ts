import type { RollValue } from "@roll";
import { DiceRollTokenProvider } from "@roll/token/dice_token";
import { ErrorToken, SuggestionToken } from "@roll/token/roll_token";

export async function roll(dice: Array<string>, assert: Chai.AssertStatic): Promise<Array<RollValue>> {
    const rollValues: Array<RollValue> = dice
        .map((dice) => {
            const token = DiceRollTokenProvider.INSTANCE.provide(dice, false);
            if (token instanceof ErrorToken) {
                assert.fail("Found Error Token: " + token.error);
            } else if (token instanceof SuggestionToken) {
                assert.fail("Found Suggestion Token: " + JSON.stringify(token.suggestions));
            } else if (token == null) {
                assert.fail(`Failed to find token for ${dice}`);
            }
            return token;
        })
        .flatMap((token) => {
            return token.provide();
        });

    const promises = rollValues.map((rollValue) => rollValue.evaluate());
    return Promise.all(promises).then(() => rollValues);
}
