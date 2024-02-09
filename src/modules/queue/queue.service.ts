import type { Channel, Connection } from 'amqplib';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { RABBITMQ_CHANNELS, RABBITMQ_CHANNELS_DATAS } from 'src/common/type';
import * as bytes from 'bytes';
import { IFileSchema } from 'src/database';
import { RABBITMQ_CLIENT } from 'src/common/config/constants';

@Injectable()
export class QueueService {
  @Inject(forwardRef(() => RABBITMQ_CLIENT))
  private readonly rabbitmqClient: Connection;

  private channels: Map<RABBITMQ_CHANNELS, Channel> = new Map();

  private async onModuleInit() {
    const new_file_upload_channel = await this.rabbitmqClient.createChannel();
    await new_file_upload_channel.assertQueue(
      RABBITMQ_CHANNELS.NEW_FILE_UPLOAD_QUEUE,
    );
    this.channels.set(
      RABBITMQ_CHANNELS.NEW_FILE_UPLOAD_QUEUE,
      new_file_upload_channel,
    );

    const send_email_channel = await this.rabbitmqClient.createChannel();
    await send_email_channel.assertQueue(RABBITMQ_CHANNELS.SEND_EMAİL_QUEUE);
    this.channels.set(RABBITMQ_CHANNELS.SEND_EMAİL_QUEUE, send_email_channel);
  }

  public get_channel(channel: RABBITMQ_CHANNELS) {
    return this.channels.get(channel);
  }

  new_file(file: IFileSchema) {
    const queue = RABBITMQ_CHANNELS.NEW_FILE_UPLOAD_QUEUE;
    const channel = this.channels.get(queue);
    const seperate_byte = bytes('100mb');
    let offset = 0;
    for (let i = 1; i <= Math.ceil(file.size / seperate_byte); i++) {
      const data: RABBITMQ_CHANNELS_DATAS['NEW_FILE_UPLOAD_QUEUE'] = {
        _id: file._id,
        offset,
        size: Math.min(seperate_byte, file.size - offset),
        name: file.name,
      };
      const body = JSON.stringify(data);
      channel.sendToQueue(queue, Buffer.from(body));
      offset += seperate_byte;
    }
  }

  send_email(_id: string, email: string, code: number) {
    const queue = RABBITMQ_CHANNELS.SEND_EMAİL_QUEUE;
    const channel = this.channels.get(queue);
    const data: RABBITMQ_CHANNELS_DATAS['SEND_EMAİL_QUEUE'] = {
      _id,
      email,
      code,
    };
    const body = JSON.stringify(data);
    return channel.sendToQueue(queue, Buffer.from(body));
  }
}
