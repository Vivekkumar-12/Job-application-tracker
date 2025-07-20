const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb://localhost:27017/jobtracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use routers
app.use('/auth', require('./routes/auth'));
app.use('/applications', require('./routes/applications'));
app.use('/profile', require('./routes/profile'));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));