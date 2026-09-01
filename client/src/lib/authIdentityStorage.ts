export const LEGACY_AUTH_IDENTITY_MIRROR_KEY = "manus-runtime-user-info";

type IdentityStorage = Pick<Storage, "removeItem">;

export function clearLegacyAuthIdentityMirror(storage: IdentityStorage) {
  storage.removeItem(LEGACY_AUTH_IDENTITY_MIRROR_KEY);
}
