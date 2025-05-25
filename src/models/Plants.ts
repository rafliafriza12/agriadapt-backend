import mongoose, { Schema } from "mongoose";
import { PartialPlant, TPlant } from "../types/plant.types";

class PlantSchema {
  private Plant;

  constructor() {
    this.Plant = this.initialSchema();
  }

  private initialSchema = (): mongoose.Schema<TPlant> => {
    return new Schema<TPlant>(
      {
        plantName: {
          type: String,
          required: true,
        },
        imgURL: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        careTips: {
          type: String,
          required: true,
        },
        longHarvestTime: {
          type: String,
          required: true,
        },
        plainType: {
          type: String,
          enum: ["rendah", "tinggi", "lereng"],
          required: true,
        },
        soilType: {
          type: String,
          enum: ["liat", "berpasir", "gambut", "humus"],
          required: true,
        },
        waterAvailability: {
          type: String,
          enum: ["melimpah", "sedang", "terbatas"],
          required: true,
        },
        plantingSeason: {
          type: String,
          enum: ["hujan", "kemarau", "peralihan"],
          required: true,
        },
      },
      { timestamps: true }
    );
  };

  public getPlantSchema = (): mongoose.Model<TPlant> => {
    return mongoose.model("plants", this.Plant);
  };
}

export default new PlantSchema().getPlantSchema();
