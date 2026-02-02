

export type FacetsRollData<T> = {
    [key: string]: FacetsRollDataField<T>;
};

export type FacetsRollDataField<T> = T | FacetsRollData<T> 