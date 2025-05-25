"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Plants_1 = __importDefault(require("../models/Plants"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const stream_1 = require("stream");
class PlantController {
    constructor() {
        // Helper function to upload buffer to Cloudinary
        this.uploadToCloudinary = (buffer, originalName) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({
                    resource_type: "image",
                    folder: "plants", // Folder di Cloudinary
                    public_id: `plant_${Date.now()}_${Math.random()
                        .toString(36)
                        .substring(7)}`,
                    transformation: [
                        { width: 800, height: 600, crop: "limit" },
                        { quality: "auto" },
                    ],
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                const readableStream = new stream_1.Readable();
                readableStream.push(buffer);
                readableStream.push(null);
                readableStream.pipe(uploadStream);
            });
        };
        // Helper function to delete image from Cloudinary
        this.deleteFromCloudinary = async (imageUrl) => {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = imageUrl.split("/");
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = `plants/${publicIdWithExtension.split(".")[0]}`;
                const result = await cloudinary_1.default.uploader.destroy(publicId);
                console.log("Cloudinary delete result:", result);
                return result.result === "ok";
            }
            catch (error) {
                console.error("Error deleting from Cloudinary:", error);
                return false;
            }
        };
        this.create = async (req, res, next) => {
            try {
                console.log("Request body:", req.body);
                console.log("Request files:", req.files);
                const { plantName, careTips, description, longHarvestTime, plainType, plantingSeason, soilType, waterAvailability, } = req.body;
                const files = req.files;
                // Validate required fields
                if (!plantName ||
                    !careTips ||
                    !description ||
                    !longHarvestTime ||
                    !plainType ||
                    !plantingSeason ||
                    !soilType ||
                    !waterAvailability) {
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
                        message: "Tipe dataran harus berisi 'rendah', 'tinggi', atau 'lereng'",
                    });
                    return;
                }
                // Validate soilType
                if (!["liat", "berpasir", "gambut", "humus"].includes(soilType.toLowerCase())) {
                    res.status(400).json({
                        status: 400,
                        message: "Jenis tanah harus berisi 'liat', 'berpasir', 'gambut', atau 'humus'",
                    });
                    return;
                }
                // Validate waterAvailability
                if (!["melimpah", "sedang", "terbatas"].includes(waterAvailability.toLowerCase())) {
                    res.status(400).json({
                        status: 400,
                        message: "Ketersediaan air harus berisi 'melimpah', 'sedang', atau 'terbatas'",
                    });
                    return;
                }
                // Validate plantingSeason
                if (!["hujan", "kemarau", "peralihan"].includes(plantingSeason.toLowerCase())) {
                    res.status(400).json({
                        status: 400,
                        message: "Musim tanam harus berisi 'hujan', 'kemarau', atau 'peralihan'",
                    });
                    return;
                }
                // Handle file upload to Cloudinary
                let imgURL = "-";
                if (files && files.length > 0) {
                    try {
                        console.log("Uploading to Cloudinary...");
                        const uploadResult = await this.uploadToCloudinary(files[0].buffer, files[0].originalname);
                        imgURL = uploadResult.secure_url;
                        console.log("Upload successful:", imgURL);
                    }
                    catch (uploadError) {
                        console.error("Cloudinary upload error:", uploadError);
                        res.status(500).json({
                            status: 500,
                            message: "Gagal mengupload gambar ke cloud storage",
                        });
                        return;
                    }
                }
                console.log("Creating plant with data:", {
                    plantName,
                    imgURL,
                    description,
                    careTips,
                    longHarvestTime,
                    plainType,
                    soilType,
                    waterAvailability,
                    plantingSeason,
                });
                // Create new plant document
                const newPlant = new Plants_1.default({
                    plantName,
                    imgURL,
                    description,
                    careTips,
                    longHarvestTime,
                    plainType,
                    soilType,
                    waterAvailability,
                    plantingSeason,
                });
                await newPlant.save();
                console.log("Plant saved successfully:", newPlant._id);
                res.status(201).json({
                    status: 201,
                    data: newPlant,
                    message: "Tumbuhan berhasil ditambahkan",
                });
                return;
            }
            catch (error) {
                console.error("Error in create plant:", error);
                res.status(500).json({
                    status: 500,
                    message: `Server Internal Error: ${error.message}`,
                    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
                });
                return;
            }
        };
        this.getAll = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const total = await Plants_1.default.countDocuments({});
                const plants = await Plants_1.default.find({})
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
            }
            catch (error) {
                console.error("Error in getAll plants:", error);
                res.status(500).json({
                    status: 500,
                    message: "Error server internal",
                });
                return;
            }
        };
        this.getByPlantId = async (req, res) => {
            try {
                const { plantId } = req.params;
                if (!plantId) {
                    res.status(400).json({
                        status: 400,
                        message: "Plant ID dibutuhkan",
                    });
                    return;
                }
                const plant = await Plants_1.default.findById(plantId);
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
            }
            catch (error) {
                console.error("Error in getByPlantId:", error);
                res.status(500).json({
                    status: 500,
                    message: "Error server internal",
                });
                return;
            }
        };
        this.deleteById = async (req, res) => {
            try {
                const { plantId } = req.params;
                if (!plantId) {
                    res.status(400).json({
                        status: 400,
                        message: "Plant ID dibutuhkan",
                    });
                    return;
                }
                const plant = await Plants_1.default.findById(plantId);
                if (!plant) {
                    res.status(404).json({
                        status: 404,
                        message: "Tanaman tidak ditemukan",
                    });
                    return;
                }
                // Delete image from Cloudinary
                if (plant.imgURL &&
                    plant.imgURL !== "-" &&
                    plant.imgURL.includes("cloudinary.com")) {
                    const deleteSuccess = await this.deleteFromCloudinary(plant.imgURL);
                    if (!deleteSuccess) {
                        console.warn("Failed to delete image from Cloudinary, but continuing with plant deletion");
                    }
                }
                await plant.deleteOne();
                res.status(200).json({
                    status: 200,
                    message: "Tanaman berhasil dihapus",
                });
                return;
            }
            catch (error) {
                console.error("Error in deleteById:", error);
                res.status(500).json({
                    status: 500,
                    message: "Error server internal",
                });
                return;
            }
        };
        // Method untuk update plant (bonus)
        this.updateById = async (req, res) => {
            try {
                const { plantId } = req.params;
                const updateData = req.body;
                const files = req.files;
                if (!plantId) {
                    res.status(400).json({
                        status: 400,
                        message: "Plant ID dibutuhkan",
                    });
                    return;
                }
                const existingPlant = await Plants_1.default.findById(plantId);
                if (!existingPlant) {
                    res.status(404).json({
                        status: 404,
                        message: "Tanaman tidak ditemukan",
                    });
                    return;
                }
                // If new image is uploaded, upload to Cloudinary and delete old one
                if (files && files.length > 0) {
                    try {
                        // Upload new image
                        const uploadResult = await this.uploadToCloudinary(files[0].buffer, files[0].originalname);
                        updateData.imgURL = uploadResult.secure_url;
                        // Delete old image from Cloudinary
                        if (existingPlant.imgURL &&
                            existingPlant.imgURL !== "-" &&
                            existingPlant.imgURL.includes("cloudinary.com")) {
                            await this.deleteFromCloudinary(existingPlant.imgURL);
                        }
                    }
                    catch (uploadError) {
                        console.error("Cloudinary upload error:", uploadError);
                        res.status(500).json({
                            status: 500,
                            message: "Gagal mengupload gambar baru",
                        });
                        return;
                    }
                }
                const updatedPlant = await Plants_1.default.findByIdAndUpdate(plantId, updateData, {
                    new: true,
                    runValidators: true,
                });
                res.status(200).json({
                    status: 200,
                    data: updatedPlant,
                    message: "Tanaman berhasil diupdate",
                });
                return;
            }
            catch (error) {
                console.error("Error in updateById:", error);
                res.status(500).json({
                    status: 500,
                    message: "Error server internal",
                });
                return;
            }
        };
    }
}
exports.default = new PlantController();
