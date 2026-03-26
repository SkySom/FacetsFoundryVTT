import type { FacetsRollData } from "@roll/facets_roll_data";

export interface FacetsRollableData {
    getFacetsRollData(): FacetsRollData<string>

    rollableData: 'rollableData'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRollableData(value: any): value is FacetsRollableData {
    return 'rollableData' in value
}