import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Connection, escape } from 'mysql';
import hash from 'object-hash';
import Server from '../server';
import JwtToken from '../interfaces/jwt-token.interface';

class TokenManager {
  public static secret: string = process.env.JWT_SECRET || 'zF5HtnU^ZoDgyW5^RF7ny6qxPY6srXGK56nbmUL6as&oF34eQ@';

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

    return jwt.sign({ ...userResult, ...{ fingerprint } }, TokenManager.secret, { expiresIn: '7d' });
  };

  public static checkLoginToken = async (req: Request, isAdmin = false) => {
    let token = req.header('authorization');
    if (!token) return false;
    token = token.replace(/^Bearer\s+/, '');

    try {
      const jwtToken: JwtToken = jwt.verify(token, TokenManager.secret) as JwtToken;

      if (isAdmin && jwtToken.permission_group !== 'admin') {
        return false;
      }

      if (jwtToken.fingerprint !== TokenManager.getFingerprint(req)) {
        return false;
      }

      const db: Connection = Server.getDatabase();
      return db.query(`SELECT id, name, email, permission_group FROM user WHERE id=${escape(jwtToken.id)};`, (err, result) => {
        if (err || result.length === 0) return false;

        [req.user] = result;

        return true;
      });
    } catch (e) {
      return false;
    }
  };
}

export default TokenManager;
