import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Connection, escape } from 'mysql';
import hash from 'object-hash';
import Server from '../server';
import JwtToken from '../interfaces/jwt-token.interface';

class TokenManager {
  private static getFingerprint = (req: Request) => {
    const fingerprint = {
      user_agent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      accept: req.headers.accept,
      encoding: req.headers['accept-encoding'],
      language: req.headers['accept-language'],
    };

    return hash(fingerprint);
  };

  public static createLoginToken = async (req: Request, userResult: any) => {
    const fingerprint = TokenManager.getFingerprint(req);

    const secret: string | undefined = process.env.JWT_SECRET;
    if (secret === undefined) {
      throw new Error('JWT_SECRET must be provided!');
    }

    return jwt.sign({ ...userResult, ...{ fingerprint } }, secret, { expiresIn: '7d' });
  };

  public static checkLoginToken = (req: Request, isAdmin = false) => new Promise((resolve) => {
    let token = req.header('authorization');
    if (!token) return resolve(false);
    token = token.replace(/^Bearer\s+/, '');

    const secret: string | undefined = process.env.JWT_SECRET;
    if (secret === undefined) {
      throw new Error('JWT_SECRET must be provided!');
    }

    try {
      const jwtToken: JwtToken = jwt.verify(token, secret) as JwtToken;

      if (isAdmin && jwtToken.permission_group !== 'admin') {
        return resolve(false);
      }

      if (jwtToken.fingerprint !== TokenManager.getFingerprint(req)) {
        return resolve(false);
      }

      const db: Connection = Server.getDatabase();
      return db.query(`SELECT id, name, email, permission_group FROM user WHERE id=${escape(jwtToken.id)};`, (err, result) => {
        if (err || result.length === 0) return resolve(false);

        [req.user] = result;
        return resolve(true);
      });
    } catch (e) {
      return resolve(false);
    }
  });
}

export default TokenManager;
