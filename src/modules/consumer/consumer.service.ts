import { Inject, Injectable, forwardRef } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { RABBITMQ_CHANNELS, RABBITMQ_CHANNELS_DATAS } from 'src/common/type';
import { AccountRepository } from 'src/database/repository/account.repository';
import { FileRepository } from 'src/database/repository/file.repository';
import { FileService } from '../file/file.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
import { generateEncodedVerifyCode } from 'src/common/helper';
import { HMAC_SECRET } from 'src/common/config';

@Injectable()
export class ConsumerService {
  @Inject(forwardRef(() => QueueService))
  private readonly queueService: QueueService;

  @Inject(forwardRef(() => FileRepository))
  private readonly fileRepository: FileRepository;

  @Inject(forwardRef(() => AccountRepository))
  private readonly accountRepository: AccountRepository;

  @Inject(forwardRef(() => StorageService))
  private readonly storageService: StorageService;

  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  onApplicationBootstrap() {
    // this.on_new_file();
    // this.on_send_email();
  }

  on_new_file() {
    const queue = RABBITMQ_CHANNELS.NEW_FILE_UPLOAD_QUEUE;
    const channel = this.queueService.get_channel(queue);

    console.log('consuming on_new_file...');
    channel.consume(queue, async (data) => {
      const { _id, offset, size, name } = JSON.parse(
        data.content.toString(),
      ) as RABBITMQ_CHANNELS_DATAS['NEW_FILE_UPLOAD_QUEUE'];

      console.log('consumed', _id, offset, size, name);

      const account =
        await this.accountRepository.get_by_available_size_and_decrease(size);
      if (!account) {
        return channel.reject(data, true);
      }

      const file_stream = await this.fileService.get_file(name, 0, size);
      if (file_stream instanceof Error) {
        await this.accountRepository.increase_available_size(account._id, size);
        return channel.reject(data, false);
      }

      const file_id = await this.storageService.upload(
        account,
        crypto.randomUUID(),
        file_stream,
      );
      if (!file_id) {
        await this.accountRepository.increase_available_size(account._id, size);
        return channel.reject(data, true);
      }

      await this.fileRepository.create_file_part(_id, {
        owner: account._id,
        name,
        offset,
        size,
        id: file_id,
      });
      channel.ack(data);
    });
  }

  on_send_email() {
    const queue = RABBITMQ_CHANNELS.SEND_EMAİL_QUEUE;
    const channel = this.queueService.get_channel(queue);

    console.log('consuming on_send_email...');
    channel.consume(queue, async (data) => {
      const { id, email, code } = JSON.parse(
        data.content.toString(),
      ) as RABBITMQ_CHANNELS_DATAS['SEND_EMAİL_QUEUE'];

      const query = generateEncodedVerifyCode(id, code, HMAC_SECRET);
      const generate_url =
        'https://domain.com/change_password_from_forgot?query=' + query;
      console.log(email, code, query, generate_url);

      channel.ack(data);
    });
  }
}
