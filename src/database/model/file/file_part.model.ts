import { Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AccountSchema } from '../account.model';

export interface IFilePartSchema {
  owner: AccountSchema;
  name: string;
  offset: number;
  size: number;
  id: string;
}

export class FilePartSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: AccountSchema.name })
  owner: AccountSchema;

  @Prop({ nullable: false })
  name: string;

  @Prop({ nullable: false })
  offset: number;

  @Prop({ nullable: false })
  size: number;

  @Prop({ nullable: false })
  id: string;
}
