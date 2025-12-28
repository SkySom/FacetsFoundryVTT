import type Document from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.d.mjs"
import type {AnyObject, EmptyObject} from "@league-of-foundry-developers/foundry-vtt-types/src/utils/index.d.mjs";
import type {DataSchema} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.d.mjs"

export class FacetsDataModel<
    Schema extends DataSchema,
    Parent extends Document.Any,
    BaseData extends AnyObject = EmptyObject,
    DerivedData extends AnyObject = EmptyObject
> extends foundry.abstract.TypeDataModel<Schema, Parent, BaseData, DerivedData> {

}