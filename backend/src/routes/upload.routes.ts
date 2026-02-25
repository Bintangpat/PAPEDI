import { Router, Request, Response } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const router = Router();

/**
 * @desc    Upload an image to Cloudinary
 * @route   POST /api/v1/upload/image
 * @access  Private (Admin)
 */
router.post(
  "/image",
  protect,
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("File gambar wajib diupload.", 400);
    }

    // Upload buffer to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "papedi/certificates",
          resource_type: "image",
          transformation: [{ quality: "auto:good", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file!.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  }),
);

export default router;
