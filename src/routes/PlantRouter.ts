import express from "express";
import PlantController from "../controllers/PlantController";
import uploadMiddleware from "../config/multer";

class PlantRouter {
  private plantRouter: express.Router;

  constructor() {
    this.plantRouter = express.Router();
    this.routes();
  }

  private routes = (): void => {
    this.plantRouter.post(
      "/",
      uploadMiddleware.array("images", 10),
      PlantController.create
    );

    this.plantRouter.get("/", PlantController.getAll);
    this.plantRouter.get("/:plantId", PlantController.getByPlantId);
    this.plantRouter.delete("/:plantId", PlantController.deleteById);
  };

  public getRouter = (): express.Router => {
    return this.plantRouter;
  };
}

export default new PlantRouter().getRouter();
