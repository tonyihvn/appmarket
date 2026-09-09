import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create base uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const logosDir = path.join(uploadsDir, 'logos');
const screenshotsDir = path.join(uploadsDir, 'screenshots');
const editorImagesDir = path.join(uploadsDir, 'editor-images');

// Create all subdirectories
[uploadsDir, logosDir, screenshotsDir, editorImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage for general uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'app-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer storage for logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer storage for screenshots
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    cb(null, screenshotsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer storage for editor images
const editorImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(editorImagesDir)) {
      fs.mkdirSync(editorImagesDir, { recursive: true });
    }
    cb(null, editorImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'editor-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, WebP, and SVG images are allowed'));
  }
};

// File size limits (in bytes)
const logoSizeLimit = 3 * 1024 * 1024; // 3MB for logos
const screenshotSizeLimit = 5 * 1024 * 1024; // 5MB for screenshots
const editorImageSizeLimit = 2 * 1024 * 1024; // 2MB for editor images

// Create multer upload middleware instances
const logoUpload = multer({
  storage: logoStorage,
  fileFilter,
  limits: {
    fileSize: logoSizeLimit,
  },
});

const screenshotUpload = multer({
  storage: screenshotStorage,
  fileFilter,
  limits: {
    fileSize: screenshotSizeLimit,
  },
});

const editorImageUpload = multer({
  storage: editorImageStorage,
  fileFilter,
  limits: {
    fileSize: editorImageSizeLimit,
  },
});

// Legacy upload (fallback)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { upload, logoUpload, screenshotUpload, editorImageUpload };
