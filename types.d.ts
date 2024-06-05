import { IAuthUser } from 'src/modules/auth/auth.service';

declare module 'express' {
  // Inject additional properties on express.Request
  interface Request {
    user: IAuthUser;
  }
}
