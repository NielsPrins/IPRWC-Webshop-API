import * as express from 'express';
import { Request, Response } from 'express';
import { Connection, escape } from 'mysql';
import ControllerBase from '../interfaces/controller.interface';
import Server from '../server';
import createId from '../classes/uid';
import adminAuthMiddleware from '../middleware/adminAuth.middleware';
import varIsSet from '../classes/var-is-set';

class ProductController implements ControllerBase {
  public router = express.Router();

  private db: Connection;

  private table = 'product';

  constructor() {
    this.initRoutes();
    this.db = Server.getDatabase();
  }

  public initRoutes() {
    this.router.get('/product/:id', this.getProduct);
    this.router.get('/product/', this.getProducts);
    this.router.post('/product/', adminAuthMiddleware, this.createProduct);
    this.router.patch('/product/', adminAuthMiddleware, this.updateProduct);
    this.router.delete('/product/', adminAuthMiddleware, this.deleteProduct);
  }

  public getProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.db.query(`SELECT * FROM ${this.table} WHERE id = ${escape(id)};`, (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }

      return res.status(200).json({
        result: result[0],
      });
    });
  };

  public getProducts = async (req: Request, res: Response) => {
    this.db.query(`SELECT * FROM ${this.table};`, (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }

      return res.status(200).json({ result });
    });
  };

  public createProduct = async (req: Request, res: Response) => {
    const { title, description, image, price } = req.body;
    const id = createId();

    if (!varIsSet([title, description, image, price])) {
      res.status(500).send();
      return;
    }

    this.db.query(`INSERT INTO ${this.table} (id, title, description, image, price) VALUES (${escape(id)}, ${escape(title)}, ${escape(description)}, ${escape(image)}, ${escape(price)});`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }
      return res.status(200).json({ result: true });
    });
  };

  public updateProduct = async (req: Request, res: Response) => {
    const { id, title, description, image, price } = req.body;
    const updateStatements: string[] = [];

    if (!varIsSet(id)) {
      res.status(500).send();
      return;
    }

    if (varIsSet(title)) {
      updateStatements.push(`title = ${escape(title)}`);
    }
    if (varIsSet(description)) {
      updateStatements.push(`description = ${escape(description)}`);
    }
    if (varIsSet(image)) {
      updateStatements.push(`image = ${escape(image)}`);
    }
    if (varIsSet(price)) {
      updateStatements.push(`price = ${escape(price)}`);
    }

    this.db.query(`UPDATE ${this.table} SET ${updateStatements.join(',')} WHERE id = ${escape(id)};`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }
      return res.status(200).json({ result: true });
    });
  };

  public deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (!varIsSet(id)) {
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

export default ProductController;
