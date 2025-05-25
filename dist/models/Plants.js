"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
class PlantSchema {
    constructor() {
        this.initialSchema = () => {
            return new mongoose_1.Schema({
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
            }, { timestamps: true });
        };
        this.getPlantSchema = () => {
            return mongoose_1.default.model("plants", this.Plant);
        };
        this.Plant = this.initialSchema();
    }
}
exports.default = new PlantSchema().getPlantSchema();
