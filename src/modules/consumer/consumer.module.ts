import { Global, Module } from "@nestjs/common";
import { ConsumerService } from "./consumer.service";
import { ConsumerController } from "./consumer.controller";

@Global()
@Module({
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService]
})
export class ConsumerModule { }