import axios from 'axios';
import { Response } from 'express';

const checkRecaptchaToken = async (res: Response, token: string) => {
  if (typeof token !== 'undefined') {
    const response = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`);

    if (response.data.success) {
      return true;
    }
  }

  res.status(401).send();
  return false;
};

export default checkRecaptchaToken;
