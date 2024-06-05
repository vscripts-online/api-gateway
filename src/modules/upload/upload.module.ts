import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer_config.service';
import { AccountModule } from '../account/account.module';

// ! Circular dependency
@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [UploadModule],
      useClass: MulterConfigService,
    }),
    AccountModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
