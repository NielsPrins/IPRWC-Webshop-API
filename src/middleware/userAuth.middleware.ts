import { Request, Response } from 'express';
import TokenManager from '../classes/tokenManager';

const userAuthMiddleware = async (req: Request, res: Response, next: any) => {
  if (await TokenManager.checkLoginToken(req, false)) {
    next();
  } else {
    res.status(401).json('Invalid Token');
  }
};

export default userAuthMiddleware;
