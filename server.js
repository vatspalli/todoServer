import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const app = express();
// Middleware to parse JSON body
app.use(json());
// Use CORS
app.use(cors());
dotenv.config();

// Connect to MongoDB Atlas
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const firstDB = client.db('firstDB');
const tasksCollection = firstDB.collection('tasks');

// Simple route to test server
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

let tasksList = [];

app.get('/getTasks', async (req, res) => {
    const tasks = await tasksCollection.find().toArray();
    tasks.sort((a, b) => a.isDone - b.isDone);
    res.send(tasks)
})

app.put('/updateTask', async (req, res) => {
  const id = req.body.id;
  const isDone = req.body.isDone;
  const result = await tasksCollection.updateOne(
    {id: id},
    {$set: {isDone: isDone}}
  )
  res.send({message: 'Task updated'})
})

app.post('/addTask', async (req, res) => {
  const id = Math.floor(Math.random() * 1001);
  const name = req.body.name;
  const task = {id, name, isDone: false};
  const result = await tasksCollection.insertOne(task);
  res.send(task);
})

app.delete('/deleteTask', async (req, res) => {
  const id = req.body.id;
  const result = await tasksCollection.deleteOne({id: id});
  res.send(id);
})

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on http://localhost:${process.env.PORT}`);
});