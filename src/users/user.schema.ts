import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  // Unique index for login & user identification
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Role-based access control
  @Prop({ required: true, default: 'user' })
  role: string;

  // Permissions (array field)
  @Prop({ type: [String], default: [] })
  permissions: string[];

  // Refresh token hash for auth
  @Prop()
  refreshTokenHash: string;

  @Prop()
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/* =========================
   INDEXES
   ========================= */

// 1️⃣ Unique email index (redundant-safe, but explicit)
UserSchema.index({ email: 1 }, { unique: true });

// 2️⃣ Role-based listing + pagination
// Used by: find({ role }).sort({ createdAt: -1 })
UserSchema.index({ role: 1, createdAt: -1 });

// 3️⃣ Text search index (search by name or email)
// Used by: { $text: { $search: "keyword" } }
UserSchema.index({
  name: 'text',
  email: 'text',
});
