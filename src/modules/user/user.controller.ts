import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthUser } from 'src/decorator';
import { AdminGuard, AuthGuard } from 'src/guard';
import { IAuthUser } from '../auth/auth.service';
import {
  UpdateTotalRequestDTO,
  UserGetFilesRequestDTO,
  UserGetUsersRequestDTO,
  UserUpdateUserFilesRequestDTO,
} from './user.request.dto';
import { UserService } from './user.service';
import { FilesGetFilesRequestDTO } from '../files/files.request.dto';

@ApiTags('user')
@Controller('/user')
export class UserController {
  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/files')
  async get_files(@Query() _params: any, @AuthUser() user: IAuthUser) {
    try {
      const params = plainToInstance(UserGetFilesRequestDTO, _params, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      });
      await validateOrReject(params);

      return this.userService.get_files(user, params);
    } catch (e) {
      throw new BadRequestException(Array.isArray(e) ? e[0].constraints : e);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/files/:id')
  async get_file(@AuthUser() user: IAuthUser, @Param('id') file_id: string) {
    return this.userService.get_file(user, file_id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('/files/:id')
  async update_file(
    @AuthUser() user: IAuthUser,
    @Param('id') file_id: string,
    @Body() body: UserUpdateUserFilesRequestDTO,
  ) {
    return this.userService.update_file(user, file_id, body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('/files/:_id')
  async delete_file(
    @AuthUser() user: IAuthUser,
    @Param('_id') file_id: string,
  ) {
    return this.userService.delete_file(user, file_id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get('/users')
  async get_users(@Query() params: UserGetUsersRequestDTO) {
    return this.userService.get_users(params);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get('/users/:userId')
  async get_user(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.get_user(userId);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get('/users/:userId/files')
  async get_user_files(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() _params: any,
  ) {
    const params = plainToInstance(FilesGetFilesRequestDTO, _params, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
    await validateOrReject(params);

    return this.userService.get_user_files(userId, params);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Post('/users/:userId/total')
  async update_user_total(
    @Body() body: UpdateTotalRequestDTO,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.update_total(userId, Number(body.size));
  }
}
