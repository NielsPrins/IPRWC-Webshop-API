import { Request, Response } from 'express';
import TokenManager from '../classes/tokenManager';

const adminAuthMiddleware = async (req: Request, res: Response, next: any) => {
  if (await TokenManager.checkLoginToken(req, true)) {
    next();
  } else {
    res.status(401).json('Invalid Token');
  }
};

export default adminAuthMiddleware;
