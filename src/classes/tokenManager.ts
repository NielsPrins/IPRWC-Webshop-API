import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Connection, escape } from 'mysql';
import hash from 'object-hash';
import Server from '../server';

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

  public static checkLoginToken = async (req: Request, res: Response, isAdmin = false) => new Promise((resolve, reject) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, TokenManager.secret, (err, decoded) => {
        if (err || decoded == null || typeof decoded === 'undefined') return reject();
        const jwtTokenData: any = decoded;

        if (isAdmin && jwtTokenData.permission_group != 'admin') {
          return reject();
        }

        if (jwtTokenData.fingerprint !== TokenManager.getFingerprint(req) && req.headers.host !== 'localhost:5000') {
          reject();
        }

        const db: Connection = Server.getDatabase();
        db.query(`SELECT * FROM user WHERE id=${escape(jwtTokenData.id)};`, (err, result) => {
          if (err || result.length === 0) return reject();

          resolve(true);
        });
      });
    } else {
      return reject();
    }
  }).catch(() => {
    res.status(401).send();
  });
}

export default TokenManager;
