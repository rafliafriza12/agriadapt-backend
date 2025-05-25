import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/AuthRouter";
import plantRouter from "./routes/PlantRouter";
import path from "path";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(express.static(path.join(__dirname, "..", "public")));
    this.app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.use("/api/auth", authRouter);
    this.app.use("/api/plant", plantRouter);
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "Hello World with TypeScript!",
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default new App().app;
