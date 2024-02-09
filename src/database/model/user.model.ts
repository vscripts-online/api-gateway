import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from './base.model';
import * as bytes from 'bytes';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUND } from 'src/common/config/constants';

export interface IUserSchema {
  _id?: Types.ObjectId;
  admin?: boolean;
  email: string;
  password: string;
  verify_code: number;
  verify_code_send_time: number[];
  used_size: number;
  total_drive: number;
}

@Schema({ collection: 'user' })
export class UserSchema extends BaseSchema implements IUserSchema {
  @Prop({ nullable: true })
  admin: boolean;

  @Prop({ nullable: false, unique: true })
  email: string;

  @Prop({ nullable: false })
  password: string;

  @Prop({ nullable: false, default: null })
  verify_code: number;

  @Prop({ nullable: false, default: 0 })
  invalid_verify_code: number;

  @Prop({ nullable: false, default: [] })
  verify_code_send_time: number[];

  @Prop({ nullable: false, default: 0 })
  used_size: number;

  @Prop({ nullable: false, default: bytes('500 mb') })
  total_drive: number;
}

export const UserSchemaClass = SchemaFactory.createForClass(UserSchema);

UserSchemaClass.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUND);
  next();
});
