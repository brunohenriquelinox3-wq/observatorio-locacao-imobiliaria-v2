import { z } from "zod";

const uuid = z.string().uuid();
const correlationId = z.string().uuid();
const reasonCode = z.string().trim().regex(/^[A-Z][A-Z0-9_]{2,79}$/);

export const organizationRoleSchema = z.enum([
  "organization_admin",
  "area_admin",
  "operator",
]);

export const workforceProfileSchema = z.enum(["collaborator", "broker"]);

const workforceScopeSelectorSchema = z
  .object({
    modules: z.array(z.enum(["loteadora", "vendas_urbanas", "locacao"])).min(1).max(3),
  })
  .strict();

export const platformRoleSchema = z.enum([
  "platform_super_admin",
  "platform_security_admin",
  "platform_support_operator",
]);

export const scopeSelectorSchema = z
  .object({
    modules: z.array(z.enum(["platform", "loteadora", "vendas_urbanas", "locacao"])).min(1).max(4),
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

export const activateSelfOrganizationAdminInputSchema = z
  .object({
    organizationId: uuid,
    correlationId,
  })
  .strict();

export const activateOrganizationInputSchema = z
  .object({
    organizationId: uuid,
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

export const requestOwnWorkforceAccessInputSchema = z
  .object({
    organizationReference: z.string().trim().min(2).max(160),
    profile: workforceProfileSchema,
    correlationId,
  })
  .strict();

export const prepareWorkforceAccessInputSchema = z
  .object({
    requestId: uuid,
    role: organizationRoleSchema,
    scopeSelector: workforceScopeSelectorSchema,
    purposeCode: z.enum(["cadastro_inicial", "operacao_interna", "revisao_cadastral"]),
    expiresAt: z.string().datetime({ offset: true }),
    correlationId,
  })
  .strict();

export const acceptOwnWorkforceAccessInputSchema = z
  .object({
    requestId: uuid,
    correlationId,
  })
  .strict();

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
export type ActivateSelfOrganizationAdminInput = z.infer<typeof activateSelfOrganizationAdminInputSchema>;
export type ActivateOrganizationInput = z.infer<typeof activateOrganizationInputSchema>;
export type SuspendMembershipInput = z.infer<typeof suspendMembershipInputSchema>;
export type RevokeMembershipInput = z.infer<typeof revokeMembershipInputSchema>;
export type WorkforceProfile = z.infer<typeof workforceProfileSchema>;
export type RequestOwnWorkforceAccessInput = z.infer<typeof requestOwnWorkforceAccessInputSchema>;
export type PrepareWorkforceAccessInput = z.infer<typeof prepareWorkforceAccessInputSchema>;
export type AcceptOwnWorkforceAccessInput = z.infer<typeof acceptOwnWorkforceAccessInputSchema>;
export type BootstrapPlatformPrincipalInput = z.infer<typeof bootstrapPlatformPrincipalInputSchema>;
export type AdministrativeRequestMeta = z.infer<typeof administrativeRequestMetaSchema>;
