import { Observable } from 'rxjs';

import { BoolValue__Output } from 'src/pb/google/protobuf/BoolValue';
import { UInt32Value__Output } from 'src/pb/google/protobuf/UInt32Value';
import { UserChangePasswordFromForgotPasswordRequestDTO__Output } from 'src/pb/user/UserChangePasswordFromForgotPasswordRequestDTO';
import { UserChangePasswordRequestDTO__Output } from 'src/pb/user/UserChangePasswordRequestDTO';
import { UserFineOneDTO__Output } from 'src/pb/user/UserFineOneDTO';
import { UserForgotPasswordRequestDTO__Output } from 'src/pb/user/UserForgotPasswordRequestDTO';
import { UserRegisterRequestDTO__Output } from 'src/pb/user/UserRegisterRequestDTO';
import { UserRegisterResponseDTO__Output } from 'src/pb/user/UserRegisterResponseDTO';

export interface IUserServiceMS {
  RegisterUser(
    data: UserRegisterRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  LoginUser(
    data: UserRegisterRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  ChangePassword(
    data: UserChangePasswordRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  ForgotPassword(
    data: UserForgotPasswordRequestDTO__Output,
  ): Observable<BoolValue__Output>;
  ChangePasswordFromForgot(
    data: UserChangePasswordFromForgotPasswordRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  FindOne(
    data: UserFineOneDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  IsAdmin(data: UInt32Value__Output): Observable<BoolValue__Output>;
}
