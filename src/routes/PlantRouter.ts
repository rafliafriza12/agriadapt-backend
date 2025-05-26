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
    // Create plant
    this.plantRouter.post(
      "/",
      (req, res, next) => {
        uploadMiddleware.array("images", 10)(req, res, (err) => {
          if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({
              status: 400,
              message: `Upload error: ${err.message}`,
            });
          }
          next();
        });
      },
      PlantController.create
    );

    // Update plant
    this.plantRouter.put(
      "/:plantId",
      (req, res, next) => {
        uploadMiddleware.array("images", 1)(req, res, (err) => {
          if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({
              status: 400,
              message: `Upload error: ${err.message}`,
            });
          }
          next();
        });
      },
      PlantController.updateById
    );

    this.plantRouter.get("/", PlantController.getPlants);
    this.plantRouter.get("/:plantId", PlantController.getByPlantId);
    this.plantRouter.delete("/:plantId", PlantController.deleteById);
  };

  public getRouter = (): express.Router => {
    return this.plantRouter;
  };
}

export default new PlantRouter().getRouter();
