// The checked places and what each one sells, with prices in dong.

export class PlaceStore {
  // place id -> (item id -> price in dong)
  constructor(
    private readonly places: ReadonlyMap<number, ReadonlyMap<number, number>>,
  ) {}

  hasPlace(placeId: number): boolean {
    return this.places.has(placeId);
  }

  // The price of an item at a place, or undefined if that place does not
  // exist or does not sell it.
  priceOf(placeId: number, itemId: number): number | undefined {
    return this.places.get(placeId)?.get(itemId);
  }
}

export function seedPlaces(): PlaceStore {
  return new PlaceStore(
    new Map([
      [
        1,
        new Map([
          [11, 45000],
          [12, 30000],
        ]),
      ],
      [2, new Map([[21, 60000]])],
    ]),
  );
}
