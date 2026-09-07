export function shouldRefreshMfaProtectedPriceQueries(wasRecent: boolean, isRecent: boolean): boolean {
  return isRecent && !wasRecent;
}
