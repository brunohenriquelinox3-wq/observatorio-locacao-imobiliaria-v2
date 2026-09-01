export type AuthorizedSubdivisionContext = {
  organizationId: string;
  organizationLabel: string;
  purposeCode: string;
};

export function resolveAuthorizedSubdivisionContext(
  selectedOrganizationId: string,
  contexts: AuthorizedSubdivisionContext[] | undefined,
): AuthorizedSubdivisionContext | undefined {
  return contexts?.find((context) => context.organizationId === selectedOrganizationId);
}

export function initialAuthorizedSubdivisionContextId(contexts: AuthorizedSubdivisionContext[] | undefined): string {
  return contexts?.length === 1 ? contexts[0].organizationId : "";
}
