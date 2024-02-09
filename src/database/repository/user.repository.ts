import * as bcrypt from 'bcrypt'
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUserSchema, UserSchema } from "../model/user.model";
import { BCRYPT_SALT_ROUND } from 'src/common/config';

@Injectable()
export class UserRepository {
  @InjectModel(UserSchema.name) private readonly model: Model<UserSchema>

  find_one_by_email(email: string) {
    return this.model.findOne({ email })
  }

  async is_admin_exists() {
    const exists = await this.model.exists({ admin: true })
    return !!exists
  }

  find_one_by_id(_id: string) {
    return this.model.findOne({ _id })
  }

  set_verify_code(_id: string, verify_code: number, verify_code_send_time: number[]) {
    return this.model.updateOne({ _id }, { verify_code, verify_code_send_time })
  }

  unshift_verify_code_send_time(_id: string) {
    return this.model.updateOne({ _id }, { $push: { verify_code_send_time: { $each: [Date.now()], $position: 0 } } })
  }

  increase_invalid_verify_code(_id: string) {
    return this.model.updateOne({ _id }, { $inc: { invalid_verify_code: 1 } })
  }

  async new_user(user: Pick<IUserSchema, 'email' | 'password' | 'admin'>) {
    return this.model.create(user)
  }

  async change_password(_id: string, password: string) {
    password = await bcrypt.hash(password, BCRYPT_SALT_ROUND)
    return this.model.updateOne({ _id }, { password, verify_code: null, invalid_verify_code: 0, verify_code_send_time: [] })
  }
}