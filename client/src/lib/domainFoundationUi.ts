import { domainContextSchema } from "@shared/domainFoundationContracts";

export function isDomainContextReady(input: {
  organizationId: string;
  module: string;
  purposeCode: string;
}): boolean {
  return domainContextSchema.safeParse(input).success;
}
