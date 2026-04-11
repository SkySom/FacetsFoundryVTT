export class RollResourceCost {
    constructor(
        readonly resource: string,
        readonly total: number
    ) {}

    withAdditional(additional: number): RollResourceCost {
        return new RollResourceCost(this.resource, this.total + additional);
    }

    toSchema() {
        return {
            resource: this.resource,
            total: this.total
        };
    }
}

export function createRollResourceCostSchema() {
    return {
        resource: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Resource",
            nullable: false
        }),
        total: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Total"
        })
    };
}

export class RollResourceResult {
    constructor(
        readonly resource: string,
        readonly total: number,
        readonly original: number,
        readonly current: number,
        readonly label: string
    ) {}

    toSchema() {
        return {
            resource: this.resource,
            total: this.total,
            original: this.original,
            current: this.current,
            label: this.label
        };
    }
}

export function createRollResourceResultSchema() {
    return {
        resource: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Resource",
            nullable: false
        }),
        total: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Total"
        }),
        original: new foundry.data.fields.NumberField({
            initial: 0,
            label: "FACETS.Fields.RollResourceResult.Original",
            nullable: false
        }),
        current: new foundry.data.fields.NumberField({
            initial: 0,
            label: "FACETS.Fields.RollResourceResult.Current",
            nullable: false
        }),
        label: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Label",
            nullable: false
        })
    };
}

export class RollResourceResultGroup {
    constructor(
        readonly text: string,
        readonly resources: RollResourceResult[]
    ) {}

    toSchema() {
        return {
            text: this.text,
            resources: this.resources.map((resource) => resource.toSchema())
        };
    }
}

export function createRollResourceResultGroupSchema() {
    return {
        text: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Text",
            nullable: false
        }),
        resources: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createRollResourceResultSchema()),
            {
                label: "FACETS.Fields.Resources"
            }
        )
    };
}

export class ActorResourceChange {
    constructor(
        readonly actor: string,
        readonly resource: string,
        readonly change: number
    ) {}

    toSchema() {
        return {
            actor: this.actor,
            resource: this.resource,
            change: this.change
        }
    }
}

export function createActorResourceChangeSchema() {
    return {
        actor: new foundry.data.fields.DocumentUUIDField({
            type: "Actor",
            nullable: false
        }),
        resource: new foundry.data.fields.StringField({
            nullable: false
        }),
        change: new foundry.data.fields.NumberField({
            initial: 0,
            integer: true,
            nullable: false
        })
    };
}

export const doom = "doom";
export const plotPoints = "plotPoints";
