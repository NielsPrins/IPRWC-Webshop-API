import express, { Application } from 'express';
import * as mysql from 'mysql';
import { Connection } from 'mysql';

class Server {
  public app: Application;

  private static database: Connection;

  public port: number;

  constructor(appInit: { port: number; middleWares: any; controllers: any; }) {
    this.app = express();
    this.port = appInit.port;
    this.init(appInit.middleWares, appInit.controllers);
  }

  private async init(middleWares: any, controllers: any): Promise<void> {
    await Server.createDatabaseConnection();
    this.middlewares(middleWares);
    this.routes(controllers);
  }

  private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }

  private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
    controllers.forEach((Controller) => {
      const controller = new Controller();
      this.app.use('/', controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the http://localhost:${this.port}`);
    });
  }

  private static async createDatabaseConnection() {
    Server.database = mysql.createConnection({
      host: process.env.DB_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    Server.database.connect((err: any) => {
      if (err) throw err;
    });
  }

  static getDatabase() {
    return this.database;
  }
}

export default Server;
