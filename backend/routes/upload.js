// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const { auth } = require('../middleware/auth'); // Keep this commented or remove if not used

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// @route   POST /api/upload
// @desc    Upload image
// @access  Public (as per previous request to remove admin functionality)
router.post('/', upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Ensure req.files is treated as an array of Multer files
        const files = req.files;

        const imageUrls = files.map(file => {
            const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          
            return {
                imageUrl: url,
                filename: file.filename
            };
        });

        res.json({
            message: 'Images uploaded successfully',
            images: imageUrls
        });

    } catch (error) {
        console.error('Upload route handler error:', error); // More specific log
        res.status(500).json({ message: 'Server error during upload' });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    console.error('Multer error caught by middleware:', error); // Added detailed log
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        // Add more specific Multer error handling if needed
        return res.status(400).json({ message: `Multer error: ${error.message}` });
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: 'Only image files are allowed!' });
    }
    
    res.status(500).json({ message: 'Server error during upload' });
});

module.exports = router;
