// Who is calling. The PA#2 build accepts only fixed fake tokens (see the
// contract's "Test data"); real sign-in replaces this module, not its callers.

export type TokenStore = ReadonlyMap<string, number>;

export function seedTokens(): TokenStore {
  return new Map([
    ["user-1", 1],
    ["user-2", 2],
    ["user-3", 3],
  ]);
}

// Returns the caller's user id, or undefined when the Authorization header is
// missing, not of the form "Bearer <token>", or names an unknown token.
export function userFromAuthorization(
  header: string | undefined,
  tokens: TokenStore,
): number | undefined {
  const match = /^Bearer (\S+)$/i.exec(header ?? "");
  return match ? tokens.get(match[1]) : undefined;
}
