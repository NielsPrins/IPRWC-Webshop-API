import { Request, Response } from 'express';
import axios from 'axios';

const recaptchaMiddleware = async (req: Request, res: Response, next: any) => {
  const { token } = req.body;

  if (typeof token !== 'undefined') {
    const response = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`);

    if (response.data.success) {
      return next();
    }
  }

  return res.status(401).send('Invalid recaptcha');
};

export default recaptchaMiddleware;
