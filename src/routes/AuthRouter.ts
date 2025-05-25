import express from "express";
import AuthController from "../controllers/AuthController";

class AuthRouter {
  public authRouter;
  constructor() {
    this.authRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.authRouter.post("/", AuthController.register);
    this.authRouter.post("/login", AuthController.login);
    this.authRouter.post("/logout", AuthController.logout);
  }
}

export default new AuthRouter().authRouter;
