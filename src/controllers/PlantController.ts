// controllers/PlantController.ts
import { Request, Response, NextFunction } from "express";
import { PlantBodyPayload, TPlant } from "../types/plant.types";
import Plants from "../models/Plants";
import { promises as fs } from "fs";
import path from "path";

declare global {
  namespace Express {
    interface Request {
      files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

class PlantController {
  private deleteFileByPath = async (fileUrl: string): Promise<boolean> => {
    try {
      const url = new URL(fileUrl);
      const relativePath = url.pathname;

      // Gabungkan dengan folder public
      const filePath = path.join(__dirname, "..", "..", "public", relativePath);

      await fs.unlink(filePath);
      console.log(`File dihapus: ${filePath}`);
      return true;
    } catch (err) {
      console.error("Gagal menghapus file:", err);
      return false;
    }
  };

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        plantName,
        careTips,
        description,
        longHarvestTime,
        plainType,
        plantingSeason,
        soilType,
        waterAvailability,
      }: PlantBodyPayload = req.body as PlantBodyPayload;

      const files = req.files as Express.Multer.File[];

      // Validate required fields
      if (
        !plantName ||
        !careTips ||
        !description ||
        !longHarvestTime ||
        !plainType ||
        !plantingSeason ||
        !soilType ||
        !waterAvailability
      ) {
        res.status(400).json({
          status: 400,
          message: "Semua field harus diisi",
        });
        return;
      }

      // Validate plainType
      if (!["rendah", "tinggi", "lereng"].includes(plainType.toLowerCase())) {
        res.status(400).json({
          status: 400,
          message:
            "Tipe dataran harus berisi 'rendah', 'tinggi', atau 'lereng'",
        });
        return;
      }

      // Validate soilType
      if (
        !["liat", "berpasir", "gambut", "humus"].includes(
          soilType.toLowerCase()
        )
      ) {
        res.status(400).json({
          status: 400,
          message:
            "Jenis tanah harus berisi 'liat', 'berpasir', 'gambut', atau 'humus'",
        });
        return;
      }

      // Validate waterAvailability
      if (
        !["melimpah", "sedang", "terbatas"].includes(
          waterAvailability.toLowerCase()
        )
      ) {
        res.status(400).json({
          status: 400,
          message:
            "Ketersediaan air harus berisi 'melimpah', 'sedang', atau 'terbatas'",
        });
        return;
      }

      // Validate plantingSeason
      if (
        !["hujan", "kemarau", "peralihan"].includes(
          plantingSeason.toLowerCase()
        )
      ) {
        res.status(400).json({
          status: 400,
          message:
            "Musim tanam harus berisi 'hujan', 'kemarau', atau 'peralihan'",
        });
        return;
      }

      // Validate file uploads
      if (!files || files.length === 0) {
        res
          .status(400)
          .json({ status: 400, message: "Tidak ada file yang diunggah." });
        return;
      }

      // Process uploaded files
      const uploadedFilesInfo = files.map((file) => ({
        fileName: file.filename,
        filePath: `${process.env.IMG_BASE_URL}/images/${file.filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }));

      // Create new plant document
      const newPlant = new Plants({
        plantName,
        imgURL: uploadedFilesInfo[0]?.filePath,
        description,
        careTips,
        longHarvestTime,
        plainType,
        soilType,
        waterAvailability,
        plantingSeason,
      });

      await newPlant.save();

      res.status(201).json({
        status: 201,
        data: newPlant,
        message: "Tumbuhan berhasil ditambahkan",
      });
    } catch (error: any) {
      res.status(500).json({
        status: 500,
        message: `Server Internal Error: ${error.message}`,
      });
    }
  };

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;
      const skip: number = (page - 1) * limit;
      const total: number = await Plants.countDocuments({});

      const plants: TPlant[] = await Plants.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      if (plants.length === 0) {
        res.status(404).json({
          status: 404,
          message: "Data tanaman tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        status: 200,
        message: "Data tumbuhan ditemukan",
        data: plants,
        currentPage: page,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      });
      return;
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Error server internal",
      });

      return;
    }
  };

  public getByPlantId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { plantId }: { plantId?: string } = req.params as {
        plantId: string;
      };

      if (!plantId) {
        res.status(400).json({
          status: 400,
          message: "Plant ID dibutuhkan",
        });
        return;
      }

      const plant: TPlant | null = await Plants.findById(plantId);

      if (!plant) {
        res.status(404).json({
          status: 404,
          message: "Tanaman tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        status: 200,
        data: plant,
        message: "Tumbuhan ditemukan",
      });
      return;
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Error server internal",
      });

      return;
    }
  };

  public deleteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { plantId }: { plantId?: string } = req.params as {
        plantId: string;
      };

      if (!plantId) {
        res.status(400).json({
          status: 400,
          message: "Plant ID dibutuhkan",
        });
        return;
      }

      const plant: TPlant | null = await Plants.findById(plantId);

      if (!plant) {
        res.status(404).json({
          status: 404,
          message: "Tanaman tidak ditemukan",
        });
        return;
      }

      const successDeleteFIle = await this.deleteFileByPath(plant.imgURL);

      if (!successDeleteFIle) {
        res.status(400).json({
          status: 400,
          message: "Gagal menghapus tanaman",
        });
        return;
      }

      await plant.deleteOne();

      res.status(200).json({
        status: 200,
        message: "Tanaman berhasil dihapus",
      });
      return;
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Error server internal",
      });

      return;
    }
  };
}

export default new PlantController();
