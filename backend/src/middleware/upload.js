import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, "uploads"),
  filename: (_req, file, callback) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  }
});

function imageFilter(_req, file, callback) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return callback(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"));
  }
  callback(null, true);
}

export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

