import { Router } from 'express';
import { protect } from '../middleware/auth';
import { logoUpload, screenshotUpload, editorImageUpload } from '../middleware/upload';
import { uploadLogo, uploadScreenshot, uploadEditorImage } from '../controllers/uploadController';

const router = Router();

/**
 * @route   POST /api/upload/logo
 * @desc    Upload app logo
 * @access  Private
 */
router.post('/logo', protect, logoUpload.single('logo'), uploadLogo);

/**
 * @route   POST /api/upload/screenshot
 * @desc    Upload app screenshot
 * @access  Private
 */
router.post('/screenshot', protect, screenshotUpload.single('screenshot'), uploadScreenshot);

/**
 * @route   POST /api/upload/editor-image
 * @desc    Upload WYSIWYG editor image
 * @access  Private
 */
router.post('/editor-image', protect, editorImageUpload.single('image'), uploadEditorImage);

export default router;
