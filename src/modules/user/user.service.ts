import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import * as ms from 'ms';
import { decodeVerifyCode, randomInteger } from "src/common/util";
import { UserRepository } from "src/database";
import { QueueService } from "../queue/queue.service";
import { UserChangePasswordFromForgotPasswordRequestDTO, UserChangePasswordRequestDTO, UserForgotPasswordRequestDTO, UserRegisterRequestDTO } from "./user.request.dto";
import { RedisService } from "../redis/redis.service";
import { REDIS_NAMESPACES } from "src/common/type";
import { ADMIN_KEY } from "src/common/config";

@Injectable()
export class UserService {
  @Inject(forwardRef(() => UserRepository))
  private readonly userRepository: UserRepository

  @Inject(forwardRef(() => QueueService))
  private readonly queueService: QueueService

  @Inject(forwardRef(() => RedisService))
  private readonly redisService: RedisService

  private generate_code(check: number): number {
    const code = randomInteger(100_000, 999_999)
    if (code === check)
      return this.generate_code(check)
    return code
  }

  async register(params: UserRegisterRequestDTO) {
    const { email, admin_key } = params

    const registered = await this.userRepository.find_one_by_email(email)
    if (registered)
      throw new BadRequestException('Email already exists')

    if (admin_key === ADMIN_KEY) {
      const is_admin_exists = await this.userRepository.is_admin_exists()
      params['admin'] = is_admin_exists ? undefined : true
    }

    const user = await this.userRepository.new_user(params)
    const session = await this.redisService.set(user._id, REDIS_NAMESPACES.SESSION)
    return Buffer.from(user._id, 'hex').toString('base64url') + '|' + session
  }

  async login(params: UserRegisterRequestDTO) {
    const { email, password } = params

    const user = await this.userRepository.find_one_by_email(email)
    if (!user)
      throw new BadRequestException('User not found')

    const verified = await bcrypt.compare(password, user.password)
    if (!verified)
      throw new BadRequestException('Wrong Password')

    const session = await this.redisService.set(user._id, REDIS_NAMESPACES.SESSION)
    return Buffer.from(user._id, 'hex').toString('base64url') + '|' + session
  }

  async change_password(_id: string, params: UserChangePasswordRequestDTO) {
    const { current_password, password } = params

    const user = await this.userRepository.find_one_by_id(_id)
    if (!user)
      throw new BadRequestException('User not found')

    const verified = await bcrypt.compare(current_password, user.password)
    if (!verified)
      throw new BadRequestException('Wrong Password')

    await this.userRepository.change_password(user._id, password)
    await this.redisService.delete_key(user._id, REDIS_NAMESPACES.SESSION)
    const session = await this.redisService.set(user._id, REDIS_NAMESPACES.SESSION)
    return Buffer.from(user._id, 'hex').toString('base64url') + '|' + session
  }

  async forgot_password(params: UserForgotPasswordRequestDTO) {
    const { email } = params
    const user = await this.userRepository.find_one_by_email(email)
    if (!user)
      throw new BadRequestException('User not found')


    /** Reject if more than 3 requests have been sent in the last 24 hours. */
    const twenty_four_hours_ago = Date.now() - ms('1 day')
    const last_three_send_times = user.verify_code_send_time?.filter(value => twenty_four_hours_ago <= value)
    if (last_three_send_times.length > 3)
      throw new BadRequestException('Too many requests, please try again later')


    const last_send_time = last_three_send_times?.[0] || 0
    const time_diff = Date.now() - last_send_time
    console.log(time_diff)

    /** If last request was sent within the last 1 minute, do nothing. */
    if (time_diff < ms('1 minutes'))
      return true

    /** If last request was sent betwweb 1 minute and 5 minute, send same code. */
    if (ms('1 minutes') < time_diff && time_diff < ms('5 minutes')) {
      await this.userRepository.unshift_verify_code_send_time(user._id)
      return this.queueService.send_email(user._id, user.email, user.verify_code)
    }

    const code = this.generate_code(user.verify_code)
    user.verify_code_send_time.unshift(Date.now())
    await this.userRepository.set_verify_code(user._id, code, user.verify_code_send_time)
    console.log(code)
    return this.queueService.send_email(user._id, user.email, code)
  }

  async change_password_from_forgot(params: UserChangePasswordFromForgotPasswordRequestDTO) {
    const { password, query } = params
    const decoded = decodeVerifyCode(query)
    if (!decoded)
      throw new BadRequestException('Invalid query')

    const { _id, code } = decoded

    const user = await this.userRepository.find_one_by_id(_id)
    if (!user)
      throw new BadRequestException('User not found')

    if (user.invalid_verify_code > 3)
      throw new BadRequestException('Resend email required')

    if (user.verify_code !== code) {
      await this.userRepository.increase_invalid_verify_code(user._id)
      throw new BadRequestException('Invalid code')
    }

    const same_password = await bcrypt.compare(password, user.password)
    if (same_password)
      throw new BadRequestException('New password can not be equal with current password')

    await this.userRepository.change_password(user._id, password)
    await this.redisService.delete_key(user._id, REDIS_NAMESPACES.SESSION)
    const session = await this.redisService.set(user._id, REDIS_NAMESPACES.SESSION)
    return Buffer.from(user._id, 'hex').toString('base64url') + '|' + session
  }
}