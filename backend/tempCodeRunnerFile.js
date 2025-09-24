
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieparser from 'cookie-parser'
import User from './models/user.js';
import AuthRoutes from './routes/Auth.js';
import AdminRoutes from './routes/AdminRoutes.js'

dotenv.config();


const app = express();



app.use(express.json());
app.use(cookieparser())
app.use(cors());

app.use('/api/auth' , AuthRoutes);
app.use('/api/admin',AdminRoutes);


app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


const port = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
