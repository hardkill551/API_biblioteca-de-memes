import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let ctId = 1;

mongoClient
  .connect()
  .then(() => (db = mongoClient.db()))
  .catch((err) => console.log(err.message));

app.get("/memes", (req, res) => {
  const category = req.query;
  console.log(category.category)
  if (!category.category) {
    db.collection("memes")
      .find()
      .toArray()
      .then((memes) => res.status(200).send(memes))
      .catch((err) => res.status(500).send(err.message));
  } else {
    db.collection("memes")
      .find()
      .toArray()
      .then((memes) =>
        res.status(200).send(memes.filter((a) => a.category === category.category))
      )
      .catch((err) => res.status(500).send(err.message));
  }
});

app.post("/memes", (req, res) => {
  const { description, image, category } = req.body;

  if (!description || !image || !category)
    return res.status(422).send("Todos campos são obrigatórios");


  db.collection("memes")
    .find()
    .toArray()
    .then((memes) => (ctId = memes.length+2))
    .catch((err) => res.status(500).send(err.message));

  const meme = { id: ctId, description, image, category };

  db.collection("memes")
    .insertOne(meme)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(500).send(err.message));
});

app.get("/memes/random", (req, res) => {
  db.collection("memes")
    .find()
    .toArray()
    .then((memes) =>
      res.status(200).send(memes[Math.floor(Math.random() * memes.length)])
    )
    .catch((err) => res.status(500).send(err.message));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
