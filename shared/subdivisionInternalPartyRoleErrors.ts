export const subdivisionInternalRoleCommandErrorCodes = [
  "SUBDIVISION_INTERNAL_ROLE_CONTEXT_DENIED",
  "DOMAIN_CONTEXT_DENIED",
  "SUBDIVISION_ACTIVE_ORGANIZATION_REQUIRED",
  "SUBDIVISION_MODULE_DENIED",
] as const;

export type SubdivisionInternalRoleCommandErrorCode =
  (typeof subdivisionInternalRoleCommandErrorCodes)[number];

export function classifySubdivisionInternalRoleCommandError(
  message: unknown
): SubdivisionInternalRoleCommandErrorCode | null {
  if (typeof message !== "string") return null;
  const normalized = message.trim();
  return subdivisionInternalRoleCommandErrorCodes.includes(
    normalized as SubdivisionInternalRoleCommandErrorCode
  )
    ? (normalized as SubdivisionInternalRoleCommandErrorCode)
    : null;
}
