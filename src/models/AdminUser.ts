import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface IAdminUser {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SALT_ROUNDS = 10;

const adminUserSchema = new mongoose.Schema<IAdminUser>(
  {
    /** Default for legacy rows that only had email + password in `admins`. */
    name: { type: String, trim: true, default: "Admin" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "admins" }
);

adminUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

export const AdminUser =
  mongoose.models.AdminUser ?? mongoose.model<IAdminUser>("AdminUser", adminUserSchema);
