import { describe, expect, it } from "vitest";
import { buyerClientDirectoryAttachmentSummaries, buyerClientDirectoryTimelineEvents, summarizeBuyerClientDirectory } from "./subdivisionBuyerClientDirectory";

describe("buyer client directory presentation", () => {
  it("summarizes only operational coverage and never a commercial measure", () => {
    expect(summarizeBuyerClientDirectory([
      { profilePresent: true, requirementsPending: 2, attachmentSummary: "awaiting_private_upload" },
      { profilePresent: false, requirementsPending: 0, attachmentSummary: "private_upload_recorded" },
    ])).toEqual({ total: 2, profilesPresent: 1, requirementsPending: 2, attachmentsRecorded: 1 });
  });

  it("keeps labels limited to redacted registration and attachment events", () => {
    expect(Object.keys(buyerClientDirectoryTimelineEvents)).not.toEqual(expect.arrayContaining(["payment_registered", "contract_signed", "sale_created"]));
    expect(Object.keys(buyerClientDirectoryAttachmentSummaries)).not.toEqual(expect.arrayContaining(["document_downloaded", "file_previewed"]));
  });
});
