import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global.module';
import { AccountModule } from './modules/account/account.module';
import { CallbackModule } from './modules/callback/callback.module';
import { FileModule } from './modules/file/file.module';
import { FilesModule } from './modules/files/files.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    GlobalModule,
    AccountModule,
    CallbackModule,
    UploadModule,
    FileModule,
    UserModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
