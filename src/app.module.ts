import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AccountModule } from './modules/account/account.module';
import { CallbackModule } from './modules/callback/callback.module';
import { ConsumerModule } from './modules/consumer/consumer.module';
import { FileModule } from './modules/file/file.module';
import { FilesModule } from './modules/files/files.module';
import { QueueModule } from './modules/queue/queue.module';
import { RedisModule } from './modules/redis/redis.module';
import { StorageModule } from './modules/storage/storage.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { MONGO_URI } from './common/config';
import { GlobalModule } from './global.module';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI, { dbName: 'vscr-cdn' }),
    GlobalModule,
    DatabaseModule,
    RedisModule,
    AccountModule,
    CallbackModule,
    UploadModule,
    StorageModule,
    QueueModule,
    ConsumerModule,
    FileModule,
    UserModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
