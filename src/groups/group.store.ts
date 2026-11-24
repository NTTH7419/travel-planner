// Group membership: which users and which trips belong to which group.

export class GroupStore {
  constructor(
    // user id -> group id (users in no group are absent)
    private readonly userGroup: ReadonlyMap<number, number>,
    // trip id -> group id
    private readonly tripGroup: ReadonlyMap<number, number>,
  ) {}

  isMemberOfTripGroup(userId: number, tripId: number): boolean {
    const group = this.tripGroup.get(tripId);
    return group !== undefined && this.userGroup.get(userId) === group;
  }
}

export function seedGroups(): GroupStore {
  return new GroupStore(
    new Map([
      [1, 1],
      [2, 1],
    ]),
    new Map([[1, 1]]),
  );
}
