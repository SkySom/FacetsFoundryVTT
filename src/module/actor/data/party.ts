import type { ActorFacets } from "@actor/base";
import type { AnyObject } from "fvtt-types/utils";

type PartyDataSchema = ReturnType<typeof partySchema>

type PartyBaseData = AnyObject;

type PartyDerivedData = {
    members: Map<string, PartyMember>
}

interface PartyMember {
  actor: ActorFacets<'character'> | null;
}


function partySchema() {
    return {
        details: new foundry.data.fields.SchemaField({
            members: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    uuid: new foundry.data.fields.DocumentUUIDField({
                        type: "Actor"
                    })
                })
            )
        }),
        doom: new foundry.data.fields.NumberField({
            initial: 0,
            positive: true
        })
    };
}

class PartyData extends foundry.abstract.TypeDataModel<
    PartyDataSchema,
    ActorFacets,
    PartyBaseData,
    PartyDerivedData
> {
    static override defineSchema(): PartyDataSchema {
        return {
            ...partySchema()
        };
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.members = new Map<string, PartyMember>();
    }
}

export { PartyData };
