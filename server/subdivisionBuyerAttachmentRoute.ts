import type { Express, RequestHandler } from "express";
import multer from "multer";
import { resolveRequestIdentity } from "./_core/context";
import { storePrivateBuyerAttachment } from "./subdivisionBuyerAttachmentUpload";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const purposeCodePattern = /^[A-Z][A-Z0-9_]{2,79}$/;

type PrivateAttachmentRouteDependencies = {
  resolveRequestIdentity: typeof resolveRequestIdentity;
  storeAttachment: typeof storePrivateBuyerAttachment;
};

const defaultDependencies: PrivateAttachmentRouteDependencies = {
  resolveRequestIdentity,
  storeAttachment: storePrivateBuyerAttachment,
};

function redactedClientError(res: Parameters<RequestHandler>[1], status: number) {
  res.status(status).json({ error: "PRIVATE_ATTACHMENT_REQUEST_REJECTED" });
}

export function registerPrivateBuyerAttachmentRoute(app: Express, dependencies = defaultDependencies) {
  const multipart = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: MAX_ATTACHMENT_BYTES, fields: 3, fieldSize: 256 },
    fileFilter: (_req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
  });

  const requireAuthenticatedGoogleSession: RequestHandler = async (req, res, next) => {
    try {
      const identity = await dependencies.resolveRequestIdentity(req);
      if (!identity.supabaseSubjectId) {
        redactedClientError(res, 401);
        return;
      }
      res.locals.privateAttachmentActor = { subjectId: identity.supabaseSubjectId };
      next();
    } catch {
      redactedClientError(res, 401);
    }
  };

  const parseSingleAttachment: RequestHandler = (req, res, next) => {
    multipart.single("attachment")(req, res, error => {
      if (error || !req.file) {
        redactedClientError(res, 400);
        return;
      }
      next();
    });
  };

  app.post("/api/private/subdivision-buyer-attachments/:attachmentIntentId", requireAuthenticatedGoogleSession, parseSingleAttachment, async (req, res) => {
    const attachmentIntentId = req.params.attachmentIntentId;
    const organizationId = typeof req.body.organizationId === "string" ? req.body.organizationId.trim() : "";
    const purposeCode = typeof req.body.purposeCode === "string" ? req.body.purposeCode.trim().toUpperCase() : "";
    const correlationId = typeof req.body.correlationId === "string" ? req.body.correlationId.trim() : "";
    const subjectId = res.locals.privateAttachmentActor?.subjectId;

    if (!uuidPattern.test(attachmentIntentId) || !uuidPattern.test(organizationId) || !uuidPattern.test(correlationId) || !purposeCodePattern.test(purposeCode) || !subjectId || !req.file) {
      redactedClientError(res, 400);
      return;
    }

    try {
      const result = await dependencies.storeAttachment({
        subjectId,
        organizationId,
        purposeCode,
        attachmentIntentId,
        correlationId,
        contentType: req.file.mimetype,
        bytes: req.file.buffer,
      });
      res.status(201).json({ attachmentIntentId: result.attachmentIntentId });
    } catch {
      redactedClientError(res, 403);
    }
  });
}
