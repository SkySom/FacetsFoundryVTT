import { ActorFacets } from "@actor/base";
import { FacetsBaseActorData, type FacetsActorSchema, type FacetsBaseData, type FacetsDerivedData } from "./base";

interface PartyDataSchema extends FacetsActorSchema {
    memberList: foundry.data.fields.SetField<foundry.data.fields.DocumentUUIDField<{ type: "Actor" }>>;
    doom: foundry.data.fields.NumberField<{
        initial: 0;
    }>;
    locked: foundry.data.fields.BooleanField<{
        initial: false;
    }>;
}

type PartyBaseData = FacetsBaseData & {
    members: Map<string, PartyMember>;
};

type PartyDerivedData = FacetsDerivedData;

type PartyMember = {
    actor: ActorFacets<"playerCharacter"> | null;
};

function partySchema() {
    return {
        memberList: new foundry.data.fields.SetField(
            new foundry.data.fields.DocumentUUIDField({
                type: "Actor"
            })
        ),
        doom: new foundry.data.fields.NumberField({
            initial: 0
        }),
        locked: new foundry.data.fields.BooleanField({
            initial: false
        })
    };
}

class PartyData extends FacetsBaseActorData<PartyDataSchema, PartyBaseData, PartyDerivedData> {
    static override defineSchema(): PartyDataSchema {
        return {
            ...super.defineSchema(),
            ...partySchema()
        };
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        this.members = new Map<string, PartyMember>();
        this.memberList.forEach((value) => {
            const result = fromUuidSync<Actor>(value);
            if (result instanceof ActorFacets) {
                this.members.set(result["uuid"] + "", { actor: result });
            }
        });
    }
}

export { PartyData, type PartyBaseData, type PartyDataSchema, type PartyDerivedData };

