import * as express from 'express';
import { Request, Response } from 'express';
import { Connection, escape } from 'mysql';
import ControllerBase from '../interfaces/controller.interface';
import Server from '../server';
import createId from '../classes/uid';
import adminAuthMiddleware from '../middleware/adminAuth.middleware';
import userAuthMiddleware from '../middleware/userAuth.middleware';
import varIsSet from '../classes/var-is-set';

class OrderController implements ControllerBase {
  public router = express.Router();

  private db: Connection;

  private table = '`order`';

  constructor() {
    this.initRoutes();
    this.db = Server.getDatabase();
  }

  public initRoutes() {
    this.router.get('/order/:id', userAuthMiddleware, this.getOrder);
    this.router.get('/order/', userAuthMiddleware, this.getOrders);
    this.router.get('/allOrders/', adminAuthMiddleware, this.getAllOrders);
    this.router.post('/order/', userAuthMiddleware, this.createOrder);
    this.router.patch('/order/', adminAuthMiddleware, this.updateOrder);
    this.router.delete('/order/', adminAuthMiddleware, this.deleteOrder);
  }

  getOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.db.query(`SELECT * FROM ${this.table} WHERE id = ${escape(id)} AND user_id = ${escape(req.user.id)};`, async (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }
      const [order] = result;

      await new Promise((resolve) => {
        this.db.query(`SELECT * FROM product INNER JOIN order_line ON (product.id = product_id) WHERE order_id = ${escape(order.id)};`, async (productErr, productResult) => {
          if (!productErr) {
            order.products = productResult;
          }
          resolve(true);
        });
      });

      return res.status(200).json({
        result: order,
      });
    });
  };

  getOrders = async (req: Request, res: Response) => {
    this.db.query(`SELECT * FROM ${this.table} WHERE user_id = ${escape(req.user.id)} ORDER BY date DESC;`, async (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }

      for (const order of result) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          this.db.query(`SELECT * FROM product INNER JOIN order_line ON (product.id = product_id) WHERE order_id = ${escape(order.id)};`, async (productErr, productResult) => {
            if (!productErr) {
              order.products = productResult;
            }
            resolve(true);
          });
        });
      }

      return res.status(200).json({ result });
    });
  };

  getAllOrders = async (req: Request, res: Response) => {
    this.db.query(`SELECT * FROM ${this.table} ORDER BY date DESC;`, async (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send();
      }

      for (const order of result) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          this.db.query(`SELECT id, name, email, permission_group FROM user WHERE id = ${escape(order.user_id)};`, async (userErr, userResult) => {
            if (!userErr) {
              [order.user] = userResult;
            }
            resolve(true);
          });
        });

        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          this.db.query(`SELECT * FROM product INNER JOIN order_line ON (product.id = product_id) WHERE order_id = ${escape(order.id)};`, async (productErr, productResult) => {
            if (!productErr) {
              order.products = productResult;
            }
            resolve(true);
          });
        });
      }

      return res.status(200).json({ result });
    });
  };

  createOrder = async (req: Request, res: Response) => {
    const { cart } = req.body;
    const orderId = createId();

    if (!varIsSet(cart) || cart.length <= 0) {
      res.status(500).send();
      return;
    }

    this.db.query(`INSERT INTO ${this.table} (id, user_id) VALUES (${escape(orderId)}, ${escape(req.user.id)});`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }

      for (const { productId, quantity } of cart) {
        this.db.query(`INSERT INTO order_line (order_id, product_id, quantity) VALUES (${escape(orderId)}, ${escape(productId)}, ${escape(quantity)});`);
      }

      return res.status(200).json({ result: true });
    });
  };

  updateOrder = async (req: Request, res: Response) => {
    const { id, userId, status } = req.body;
    const updateStatements: string[] = [];

    if (!varIsSet(id)) {
      res.status(500).send();
      return;
    }

    if (varIsSet(userId)) {
      updateStatements.push(`user_id = ${escape(userId)}`);
    }
    if (varIsSet(status)) {
      updateStatements.push(`status = ${escape(status)}`);
    }

    this.db.query(`UPDATE ${this.table} SET ${updateStatements.join(',')} WHERE id = ${escape(id)};`, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(500).send();
      }
      return res.status(200).json({ result: true });
    });
  };

  deleteOrder = async (req: Request, res: Response) => {
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

export default OrderController;
