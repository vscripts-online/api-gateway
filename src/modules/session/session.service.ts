import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SessionServiceHandlers } from 'pb/session/SessionService';
import { firstValueFrom } from 'rxjs';
import { SESSION_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';

@Injectable()
export class SessionService implements OnModuleInit {
  @Inject(forwardRef(() => SESSION_MS_CLIENT))
  private readonly client: ClientGrpc;

  private sessionService: GrpcService<SessionServiceHandlers>;

  onModuleInit() {
    this.sessionService = this.client.getService('SessionService');
  }

  set(id: number) {
    return firstValueFrom(this.sessionService.NewSession({ id }));
  }

  async delete_key(id: number) {
    return firstValueFrom(this.sessionService.DelSession({ id }));
  }

  async exists(id: number, session: string) {
    return firstValueFrom(this.sessionService.GetSession({ id, session }));
  }
}
