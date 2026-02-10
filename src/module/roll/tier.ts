import { localize, format } from "../util/localize";

export enum RollTier {
    NONE,
    EASY,
    AVERAGE,
    HARD,
    FORMIDABLE,
    HEROIC,
    INCREDIBLE,
    RIDICULOUS,
    IMPOSSIBLE
}

export class TierResult {
    readonly localized: string;

    constructor(
        readonly regular: RollTier,
        readonly extraordinary?: RollTier
    ) {
        if (extraordinary) {
            this.localized = format("Roll.ExtraordinaryResult", {
                regular: localize(`Roll.Tiers.${RollTier[regular]}`),
                extraordinary: localize(`Roll.Tiers.${RollTier[extraordinary]}`)
            });
        } else {
            this.localized = format("Roll.Result", {
                regular: localize(`Roll.Tiers.${RollTier[regular]}`)
            });
        }
    }
}

export function getRollTiers(total: number): TierResult {
    const regular = getRollTier(total) ?? RollTier.NONE;
    const extraodinary = getRollTier(total - 7);
    return new TierResult(regular, extraodinary);
}

function getRollTier(total: number): RollTier | undefined {
    if (total < 3) {
        return;
    } else if (total < 7) {
        return RollTier.EASY;
    } else if (total < 11) {
        return RollTier.AVERAGE;
    } else if (total < 15) {
        return RollTier.HARD;
    } else if (total < 19) {
        return RollTier.FORMIDABLE;
    } else if (total < 23) {
        return RollTier.HEROIC;
    } else if (total < 27) {
        return RollTier.INCREDIBLE;
    } else if (total < 31) {
        return RollTier.RIDICULOUS;
    } else {
        return RollTier.IMPOSSIBLE;
    }
}
