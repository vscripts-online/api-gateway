import { Controller, Get, Inject, Query, forwardRef } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('/')
export class CallbackController {
  @Inject(forwardRef(() => CallbackService))
  private readonly callbackService: CallbackService;

  @Get('/callback_google')
  callback_google(@Query('state') id: string, @Query('code') code: string) {
    return this.callbackService.callback_google(id, code);
  }
}
