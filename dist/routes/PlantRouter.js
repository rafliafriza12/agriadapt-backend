"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PlantController_1 = __importDefault(require("../controllers/PlantController"));
const multer_1 = __importDefault(require("../config/multer"));
class PlantRouter {
    constructor() {
        this.routes = () => {
            // Create plant
            this.plantRouter.post("/", (req, res, next) => {
                multer_1.default.array("images", 10)(req, res, (err) => {
                    if (err) {
                        console.error("Multer error:", err);
                        return res.status(400).json({
                            status: 400,
                            message: `Upload error: ${err.message}`,
                        });
                    }
                    next();
                });
            }, PlantController_1.default.create);
            // Update plant
            this.plantRouter.put("/:plantId", (req, res, next) => {
                multer_1.default.array("images", 1)(req, res, (err) => {
                    if (err) {
                        console.error("Multer error:", err);
                        return res.status(400).json({
                            status: 400,
                            message: `Upload error: ${err.message}`,
                        });
                    }
                    next();
                });
            }, PlantController_1.default.updateById);
            this.plantRouter.get("/", PlantController_1.default.getAll);
            this.plantRouter.get("/:plantId", PlantController_1.default.getByPlantId);
            this.plantRouter.delete("/:plantId", PlantController_1.default.deleteById);
        };
        this.getRouter = () => {
            return this.plantRouter;
        };
        this.plantRouter = express_1.default.Router();
        this.routes();
    }
}
exports.default = new PlantRouter().getRouter();
