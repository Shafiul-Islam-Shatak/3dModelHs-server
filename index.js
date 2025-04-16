const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

const uri = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;
let collection3d;

async function connectToDatabase() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db('3d-project');
    collection3d = db.collection('3d-file-collections');
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

connectToDatabase();

// File upload endpoint
app.post('/file-upload', async (req, res) => {
    try {
      const { url, name } = req.body;
  
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
  
      // Check if URL already exists in the database
      const existingModel = await collection3d.findOne({ url });
  
      if (existingModel) {
        return res.status(409).json({ 
          message: 'This URL already exists in the database.', 
          model: existingModel 
        });
      }
  
      // Insert new model URL
      const result = await collection3d.insertOne({ url,name });
  
      res.status(201).json({
        message: '3D model URL saved successfully',
        id: result.insertedId
      });
  
    } catch (err) {
      console.error('Error saving 3D model:', err);
      res.status(500).json({ error: 'Failed to save 3D model URL' });
    }
  });
  

// Get the models data
app.get('/models/:id', async (req, res) => {
    try {
      const id = req.params.id
      const model = await collection3d.findOne({_id : new ObjectId(id)})
      res.json(model);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // get all models
  app.get('/all-models', async(req, res)=>{
    try{
      const models= await collection3d.find().toArray()
      console.log('all models', models)
      res.json(models);
    }
    catch(err){
      console.log(err)
      res.status(500).json({error: err.message})
    }
  })





app.get("/", (req, res) => {
  res.send("Server is running");
});