const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const File = require('../models/File');
const { encryptFile, decryptFile } = require('../utils/encryption');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Encrypt file
    const { iv, authTag, encrypted } = encryptFile(req.file.buffer);

    // Save to database
    const file = new File({
      owner: req.user.id,
      originalName: req.file.originalname,
      encryptedData: encrypted,
      iv,
      authTag,
      fileSize: req.file.size
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: file._id,
      fileName: file.originalName,
      fileSize: file.fileSize
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List user's files
router.get('/list', auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id }).select('_id originalName fileSize uploadedAt');
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download file (owner only)
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, owner: req.user.id });

    if (!file) {
      return res.status(403).json({ error: 'File not found or access denied' });
    }

    // Decrypt file
    const decrypted = decryptFile(file.encryptedData, file.iv, file.authTag);

    // Send file
    res.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.set('Content-Type', 'application/octet-stream');
    res.send(decrypted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
router.delete('/delete/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.fileId, owner: req.user.id });

    if (!file) {
      return res.status(403).json({ error: 'File not found or access denied' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;