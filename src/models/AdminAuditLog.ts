import mongoose from "mongoose";

export interface IAdminAuditLog {
  actorId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  description?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminAuditLogSchema = new mongoose.Schema<IAdminAuditLog>(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    action: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    resourceId: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    description: { type: String, trim: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AdminAuditLog =
  mongoose.models.AdminAuditLog ??
  mongoose.model<IAdminAuditLog>("AdminAuditLog", adminAuditLogSchema);
