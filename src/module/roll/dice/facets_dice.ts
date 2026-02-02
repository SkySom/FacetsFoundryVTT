import type { RollValueCategory } from "../value/roll_value_category";

export interface FacetsDice {
    facets: number;

    category: RollValueCategory;

    roll(): number;
}
