
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only TXT, PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Upload single file
router.post('/file', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { category, tags } = req.body;
    
    // Read file content
    const filePath = req.file.path;
    let content = '';
    
    try {
      if (req.file.mimetype === 'text/plain') {
        content = fs.readFileSync(filePath, 'utf8');
      } else {
        // For other file types, store file path for now
        // In production, you'd use libraries like pdf-parse, mammoth, etc.
        content = `File uploaded: ${req.file.originalname}. Content extraction not implemented for this file type.`;
      }
    } catch (readError) {
      console.error('File read error:', readError);
      content = `Error reading file content: ${readError.message}`;
    }

    // Create document record
    const document = new Document({
      name: req.file.originalname,
      originalName: req.file.originalname,
      content: content,
      type: path.extname(req.file.originalname).substring(1).toLowerCase(),
      size: req.file.size,
      filePath: filePath,
      category: category?.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: document._id,
        name: document.name,
        type: document.type,
        size: document.size,
        category: document.category,
        tags: document.tags
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

// Upload multiple files
router.post('/files', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { category, tags } = req.body;
    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Read file content
        let content = '';
        
        if (file.mimetype === 'text/plain') {
          content = fs.readFileSync(file.path, 'utf8');
        } else {
          content = `File uploaded: ${file.originalname}. Content extraction not implemented for this file type.`;
        }

        // Create document record
        const document = new Document({
          name: file.originalname,
          originalName: file.originalname,
          content: content,
          type: path.extname(file.originalname).substring(1).toLowerCase(),
          size: file.size,
          filePath: file.path,
          category: category?.trim(),
          tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await document.save();
        
        results.push({
          id: document._id,
          name: document.name,
          type: document.type,
          size: document.size
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        errors.push({
          filename: file.originalname,
          error: fileError.message
        });
        
        // Clean up file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${results.length} files uploaded successfully`,
      data: {
        uploaded: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up uploaded files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Multiple file upload failed'
    });
  }
});

// Delete uploaded file
router.delete('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;
