import { z } from "zod";

const uuid = z.string().uuid();
const correlationId = z.string().uuid();
const reasonCode = z.string().trim().regex(/^[A-Z][A-Z0-9_]{2,79}$/);

export const organizationRoleSchema = z.enum([
  "organization_admin",
  "area_admin",
  "operator",
]);

export const platformRoleSchema = z.enum([
  "platform_super_admin",
  "platform_security_admin",
  "platform_support_operator",
]);

export const scopeSelectorSchema = z
  .object({
    modules: z.array(z.enum(["platform", "vendas_urbanas", "locacao"])).min(1).max(3),
    resourceIds: z.array(uuid).max(20).optional(),
  })
  .strict();

export const provisionOrganizationInputSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    domain: z.string().trim().toLowerCase().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/).optional(),
    correlationId,
  })
  .strict();

export const grantMembershipInputSchema = z
  .object({
    organizationId: uuid,
    subjectId: uuid,
    role: organizationRoleSchema,
    scopeSelector: scopeSelectorSchema,
    purposeCode: z.string().trim().regex(/^[a-z][a-z0-9_]{2,95}$/),
    expiresAt: z.string().datetime({ offset: true }).optional(),
    correlationId,
  })
  .strict();

export const suspendMembershipInputSchema = z
  .object({
    membershipId: uuid,
    reasonCode,
    correlationId,
  })
  .strict();

export const revokeMembershipInputSchema = suspendMembershipInputSchema;

export const bootstrapPlatformPrincipalInputSchema = z
  .object({
    subjectId: uuid,
    correlationId,
  })
  .strict();

export const administrativeRequestMetaSchema = z
  .object({ correlationId })
  .strict();

export type ProvisionOrganizationInput = z.infer<typeof provisionOrganizationInputSchema>;
export type GrantMembershipInput = z.infer<typeof grantMembershipInputSchema>;
export type SuspendMembershipInput = z.infer<typeof suspendMembershipInputSchema>;
export type RevokeMembershipInput = z.infer<typeof revokeMembershipInputSchema>;
export type BootstrapPlatformPrincipalInput = z.infer<typeof bootstrapPlatformPrincipalInputSchema>;
export type AdministrativeRequestMeta = z.infer<typeof administrativeRequestMetaSchema>;
