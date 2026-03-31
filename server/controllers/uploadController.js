import asyncHandler from 'express-async-handler';

// Upload single image
export const uploadSingleImage = asyncHandler(async (req, res) => {
  if (req.file) {
    const imageUrl = `/public/images/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'No image uploaded',
    });
  }
});

// Upload multiple images
export const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (req.files && req.files.length > 0) {
    const images = req.files.map(file => ({
      url: `/public/images/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      count: images.length,
      data: images,
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'No images uploaded',
    });
  }
});
