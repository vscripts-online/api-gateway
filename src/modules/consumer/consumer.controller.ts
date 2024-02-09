import { Controller, Get, Inject, forwardRef } from '@nestjs/common';
import { ConsumerService } from './consumer.service';

@Controller('/consumer')
export class ConsumerController {
  @Inject(forwardRef(() => ConsumerService))
  private readonly consumerService: ConsumerService;

  @Get('/')
  consume() {
    return this.consumerService.on_new_file();
  }
}
