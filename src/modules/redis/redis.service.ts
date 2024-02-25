import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { SESSION_MS_CLIENT } from 'src/common/config/constants';
import { BoolValue__Output } from 'src/pb/google/protobuf/BoolValue';
import { Session__Output } from 'src/pb/session/Session';
import { SessionUser__Output } from 'src/pb/session/SessionUser';

interface ISessionServiceMS {
  NewSession(data: SessionUser__Output): Observable<Session__Output>;
  GetSession(data: Session__Output): Observable<BoolValue__Output>;
  DelSession(data: SessionUser__Output): Observable<BoolValue__Output>;
}

@Injectable()
export class RedisService implements OnModuleInit {
  @Inject(forwardRef(() => SESSION_MS_CLIENT))
  private readonly client: ClientGrpc;

  private sessionService: ISessionServiceMS;

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
