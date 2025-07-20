const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');

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

// Get all applications for user, with optional status filter
router.get('/', auth, async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.userId };
  if (status) filter.status = status;
  const apps = await Application.find(filter).sort({ createdAt: -1 });
  res.json(apps);
});

// Create new application
router.post('/', auth, async (req, res) => {
  const { title, company, status } = req.body;
  const app = new Application({ title, company, status, user: req.userId });
  await app.save();
  res.status(201).json(app);
});

// Update application status
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { status },
    { new: true }
  );
  if (!app) return res.status(404).json({ error: 'Not found' });
  res.json(app);
});

// Delete application
router.delete('/:id', auth, async (req, res) => {
  await Application.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ message: 'Deleted' });
});

module.exports = router; 