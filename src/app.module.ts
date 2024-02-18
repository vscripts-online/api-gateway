import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MONGO_DATABASE, MONGO_HOST, MONGO_PORT } from './common/config';
import { DatabaseModule } from './database/database.module';
import { AccountModule } from './modules/account/account.module';
import { CallbackModule } from './modules/callback/callback.module';
import { ConsumerModule } from './modules/consumer/consumer.module';
import { FileModule } from './modules/file/file.module';
import { QueueModule } from './modules/queue/queue.module';
import { StorageModule } from './modules/storage/storage.module';
import { UploadModule } from './modules/upload/upload.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${MONGO_HOST}:${MONGO_PORT}`, {
      dbName: MONGO_DATABASE,
    }),
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
