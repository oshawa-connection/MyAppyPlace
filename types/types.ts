export type modelInterface<T> = {
    [P in keyof T]?: T[P];
}


interface crs {
    type : "string",
    properties : object
}

export interface geoJSON {
    coordinates : Array<any>,
    "type" : "point"| "polygon",
    crs: object
}

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
export type FixedLengthArray<T extends any[]> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [Symbol.iterator]: () => IterableIterator< ArrayItems<T> > }