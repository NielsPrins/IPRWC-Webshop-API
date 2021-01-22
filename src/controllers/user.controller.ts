import * as express from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Connection, escape } from 'mysql';
import ControllerBase from '../interfaces/controller.interface';
import TokenManager from '../classes/tokenManager';
import Server from '../server';
import createId from '../classes/uid';
import adminAuthMiddleware from '../middleware/adminAuth.middleware';
import recaptchaMiddleware from '../middleware/recaptha.middleware';

class UserController implements ControllerBase {
  public router = express.Router();

  private db: Connection;

  private table = 'user';

  constructor() {
    this.initRoutes();
    this.db = Server.getDatabase();
  }

  public initRoutes() {
    this.router.get('/user/:id', adminAuthMiddleware, this.getUser);
    this.router.post('/user/checkLogin', recaptchaMiddleware, this.checkLogin);
    this.router.post('/user/', recaptchaMiddleware, this.createUser);
    this.router.patch('/user/', adminAuthMiddleware, this.updateUser);
    this.router.delete('/user/', adminAuthMiddleware, this.deleteUser);
  }

  hashPassword = async (password: string): Promise<string> => new Promise((resolve, reject) => {
    bcrypt.hash(password, 7, (err, hash) => {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });

  getUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.db.query(`SELECT id, name, email FROM ${this.table} WHERE id = ${escape(id)};`, (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }

      return res.status(200).json({
        result: result[0],
      });
    });
  };

  checkLogin = async (req: Request, res: Response) => {
    const { email, password, token } = req.body;

    if (typeof email === 'undefined' || typeof password === 'undefined') {
      res.status(500).send();
      return;
    }

    this.db.query(`SELECT * FROM ${this.table} WHERE email=${escape(email)};`, (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }
      [result] = result;

      return bcrypt.compare(password, result.password, async (error, login_result) => {
        if (login_result) {
          delete result.password;
          const userToken = await TokenManager.createLoginToken(req, result);

          return res.status(200).json({
            login: 'success',
            token: userToken,
            result,
          });
        }
        return res.status(500).send();
      });
    });
  };

  createUser = async (req: Request, res: Response) => {
    const {
      name, email, password,
    } = req.body;
    const id = createId();

    if (typeof name === 'undefined' || typeof email === 'undefined' || typeof password === 'undefined') {
      res.status(500).send();
      return;
    }

    if (name === '' || email === '' || password === '') {
      res.status(500).send();
      return;
    }

    const passwordHash = await this.hashPassword(password);

    this.db.query(`INSERT INTO ${this.table} (id, name, email, password) VALUES (${escape(id)}, ${escape(name)}, ${escape(email)}, ${escape(passwordHash)});`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }
      return res.status(200).json({ result: true });
    });
  };

  updateUser = async (req: Request, res: Response) => {
    const {
      id, name, email, password,
    } = req.body;
    const updateStatements: string[] = [];

    if (typeof id === 'undefined' || id === '') {
      res.status(500).send();
      return;
    }

    if (typeof name !== 'undefined' && name !== '') {
      updateStatements.push(`name = ${escape(name)}`);
    }
    if (typeof email !== 'undefined' && email !== '') {
      updateStatements.push(`email = ${escape(email)}`);
    }
    if (typeof password !== 'undefined' && password !== '') {
      const passwordHash = await this.hashPassword(password);
      updateStatements.push(`password = ${escape(passwordHash)}`);
    }

    this.db.query(`UPDATE ${this.table} SET ${updateStatements.join(',')} WHERE id = ${escape(id)};`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }
      return res.status(200).json({ result: true });
    });
  };

  deleteUser = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (typeof id === 'undefined') {
      res.status(500).send();
      return;
    }

    this.db.query(`DELETE FROM ${this.table} WHERE id = ${escape(id)};`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }
      return res.status(200).json({ result: true });
    });
  };
}

export default UserController;
