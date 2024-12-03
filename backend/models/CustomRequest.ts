import { Request } from 'express';
import session from 'express-session';

interface CustomRequest extends Request {
    session: session.Session & Partial<session.SessionData> & {
      access_token?: string;
      refresh_token?: string;
      state?: string;
    };
  }

export default CustomRequest;