import type { AnyObject } from "fvtt-types/utils";
import { FacetsBaseActorData, type FacetsActorSchema } from "../../actor/data/base";

type CompanionSchema = FacetsActorSchema;

type CompanionBaseData = AnyObject;

type CompanionDerivedData = AnyObject;

function companionSchema() {
    return {};
}

class CompanionData extends FacetsBaseActorData<
    CompanionSchema,
    CompanionBaseData,
    CompanionDerivedData
> {
    static override defineSchema(): CompanionSchema {
        return {
            ...super.defineSchema(),
            ...companionSchema()
        };
    }

    override generatesDoom(): boolean {
        return false;
    }
}

export {
    CompanionData,
    type CompanionBaseData,
    type CompanionDerivedData,
    type CompanionSchema
};
