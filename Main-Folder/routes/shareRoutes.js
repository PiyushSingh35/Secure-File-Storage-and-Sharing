const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const File = require('../models/File');
const ShareToken = require('../models/ShareToken');
const { decryptFile } = require('../utils/encryption');

const router = express.Router();

// Generate share token
router.post('/create/:fileId', auth, async (req, res) => {
  try {
    const { expiryHours = 24, maxDownloads = -1 } = req.body;

    // Check if file exists and belongs to user
    const file = await File.findOne({ _id: req.params.fileId, owner: req.user.id });
    if (!file) {
      return res.status(403).json({ error: 'File not found or access denied' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // Create share token
    const shareToken = new ShareToken({
      file: file._id,
      token,
      createdBy: req.user.id,
      expiresAt,
      maxDownloads
    });

    await shareToken.save();

    const shareUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/share/download/${token}`;

    res.json({
      message: 'Share link created',
      shareUrl,
      token,
      expiresAt,
      maxDownloads
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public download via share token (NO AUTH REQUIRED)
router.get('/download/:token', async (req, res) => {
  try {
    // Find share token
    const shareToken = await ShareToken.findOne({ token: req.params.token })
      .populate('file');

    if (!shareToken) {
      return res.status(410).json({ error: 'Link expired or invalid' });
    }

    // Check if expired
    if (shareToken.expiresAt < new Date()) {
      await ShareToken.deleteOne({ _id: shareToken._id });
      return res.status(410).json({ error: 'Link has expired' });
    }

    // Check download limit
    if (shareToken.maxDownloads > 0 && shareToken.downloadCount >= shareToken.maxDownloads) {
      return res.status(410).json({ error: 'Download limit reached' });
    }

    const file = shareToken.file;

    // Decrypt file
    const decrypted = decryptFile(file.encryptedData, file.iv, file.authTag);

    // Increment download count
    shareToken.downloadCount += 1;
    await shareToken.save();

    // Send file
    res.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.set('Content-Type', 'application/octet-stream');
    res.send(decrypted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get share token info
router.get('/info/:token', async (req, res) => {
  try {
    const shareToken = await ShareToken.findOne({ token: req.params.token })
      .populate('file', 'originalName fileSize');

    if (!shareToken) {
      return res.status(410).json({ error: 'Link invalid' });
    }

    res.json({
      fileName: shareToken.file.originalName,
      fileSize: shareToken.file.fileSize,
      expiresAt: shareToken.expiresAt,
      downloadCount: shareToken.downloadCount,
      maxDownloads: shareToken.maxDownloads,
      expired: shareToken.expiresAt < new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List share tokens created by user
router.get('/list', auth, async (req, res) => {
  try {
    const shareTokens = await ShareToken.find({ createdBy: req.user.id })
      .populate('file', 'originalName fileSize')
      .select('token expiresAt downloadCount maxDownloads');

    res.json({ shareTokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete share token
router.delete('/delete/:tokenId', auth, async (req, res) => {
  try {
    const shareToken = await ShareToken.findOneAndDelete({
      _id: req.params.tokenId,
      createdBy: req.user.id
    });

    if (!shareToken) {
      return res.status(403).json({ error: 'Token not found' });
    }

    res.json({ message: 'Share link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;