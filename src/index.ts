import cors from 'cors';
import * as bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Server from './server';
import 'reflect-metadata';
import UserController from './controllers/user.controller';
import ProductController from './controllers/product.controller';
import User from './interfaces/user.interface';
import OrderController from './controllers/order.controller';

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

dotenv.config();

const app = new Server({
  port: 5000,
  controllers: [
    UserController,
    ProductController,
    OrderController,
  ],
  middleWares: [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cors(),
  ],
});

app.listen();

export default app;
