// backend.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Connect to MongoDB using the Kubernetes service name
mongoose.connect('mongodb://mongodb-service:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

// Define a simple schema for testing
const TestSchema = new mongoose.Schema({
  message: String,
});

const TestModel = mongoose.model('TestModel', TestSchema);

// Define a route to insert data into MongoDB
app.post('/insert', async (req, res) => {
  const { message } = req.body;
  const test = new TestModel({ message });

  try {
    await test.save();
    res.json({ success: true, message: 'Data inserted successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
