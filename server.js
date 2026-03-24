console.log("SERVER FILE RESTARTED");
console.log("SERVER RUNNING");
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME);
const todos = db.collection("todos");

app.get("/api/todos", async (req, res) => {
  console.log("GET /api/todos was hit");

  try {
    const allTodos = await todos.find().toArray();
    res.json(allTodos);
  } catch (err) {
  console.error("GET /api/todos failed:", err);
  res.status(500).json({
    message: "Failed to fetch todos",
    error: String(err)
  });
}
});

app.post("/api/todos", async (req, res) => {
  try {
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const newTodo = {
      text,
      done: false,
      createdAt: new Date(),
    };

    const result = await todos.insertOne(newTodo);
    res.status(201).json({ _id: result.insertedId, ...newTodo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create todo" });
  }
});

app.patch("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const update = {};

    if (typeof req.body.text === "string") {
      const trimmed = req.body.text.trim();

      if (!trimmed) {
        return res.status(400).json({ message: "Text cannot be empty" });
      }

      update.text = trimmed;
    }

    if (typeof req.body.done === "boolean") {
      update.done = req.body.done;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await todos.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    const updatedTodo = await todos.findOne({ _id: new ObjectId(id) });

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const result = await todos.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}
startServer();