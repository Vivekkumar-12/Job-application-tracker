const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Multer setup for profile photo
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo_${req.userId}_${Date.now()}${ext}`);
  }
});
const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpg|jpeg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Multer setup for resume
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.userId}_${Date.now()}${ext}`);
  }
});
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX allowed'));
  }
});

// Get user profile and applications
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  const applications = await Application.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ user, applications });
});

// Update name/email
router.put('/edit', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Profile update failed', details: err.message });
  }
});

// Upload profile photo
router.post('/photo', auth, photoUpload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { profilePhoto: photoUrl },
    { new: true }
  ).select('-password');
  res.json({ user, photoUrl });
});

// Upload resume
router.post('/resume', auth, resumeUpload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const resumeUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { resume: resumeUrl },
    { new: true }
  ).select('-password');
  res.json({ user, resumeUrl });
});

module.exports = router; 