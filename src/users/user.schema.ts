import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: true, default: "user" })
  role: string;

  @Prop({ required: true, default: [] })
  permissions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
