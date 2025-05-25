import { Document } from "mongoose";
export interface TPlant extends Document {
  _id: any;
  plantName: string;
  imgURL: string;
  description: string;
  careTips: string;
  longHarvestTime: string;
  plainType: "rendah" | "tinggi" | "lereng";
  soilType: "liat" | "berpasir" | "gambut" | "humus";
  waterAvailability: "melimpah" | "sedang" | "terbatas";
  plantingSeason: "hujan" | "kemarau" | "peralihan";
  createdAt: Date;
  updateAt: Date;
  __v: number;
}

export type PartialPlant = Partial<TPlant>;

export type PlantBodyPayload = Pick<
  TPlant,
  | "plantName"
  | "description"
  | "careTips"
  | "longHarvestTime"
  | "plainType"
  | "soilType"
  | "waterAvailability"
  | "plantingSeason"
>;
