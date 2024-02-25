import { Observable } from 'rxjs';

import { BoolValue__Output } from 'src/pb/google/protobuf/BoolValue';
import { Session__Output } from 'src/pb/session/Session';
import { SessionUser__Output } from 'src/pb/session/SessionUser';

export interface ISessionServiceMS {
  NewSession(data: SessionUser__Output): Observable<Session__Output>;
  GetSession(data: Session__Output): Observable<BoolValue__Output>;
  DelSession(data: SessionUser__Output): Observable<BoolValue__Output>;
}
