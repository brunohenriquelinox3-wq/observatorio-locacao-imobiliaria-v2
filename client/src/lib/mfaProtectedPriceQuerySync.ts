export function shouldRefreshSessionPriceQueries(wasSessionMfa: boolean, hasSessionMfa: boolean): boolean {
  return hasSessionMfa && !wasSessionMfa;
}
