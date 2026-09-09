import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const uploadLogo = (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    // Return the file path that can be used in the app
    const filePath = `/uploads/logos/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      fileName: req.file.filename,
      filePath,
      url: `${baseUrl}${filePath}`,
    });
  } catch (error: any) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
      error,
    });
  }
};

export const uploadScreenshot = (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const filePath = `/uploads/screenshots/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      success: true,
      message: 'Screenshot uploaded successfully',
      fileName: req.file.filename,
      filePath,
      url: `${baseUrl}${filePath}`,
    });
  } catch (error: any) {
    console.error('Screenshot upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
      error,
    });
  }
};

export const uploadEditorImage = (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const filePath = `/uploads/editor-images/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      fileName: req.file.filename,
      filePath,
      url: `${baseUrl}${filePath}`,
    });
  } catch (error: any) {
    console.error('Editor image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
      error,
    });
  }
};
