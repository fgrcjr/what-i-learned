const express = require("express");
const router = express.Router();
const { getConnectedClient } = require("./database");
const { ObjectId } = require("mongodb");

const getCollection = () => {
  const client = getConnectedClient();
  const collection = client.db("todosdb").collection("todos");
  return collection;
};

// GET
router.get("/todos", async (request, response) => {
  const collection = getCollection();
  const todos = await collection.find({}).toArray();

  response.status(200).json(todos);
});

// POST
router.post("/todos", async (request, response) => {
  const collection = getCollection();
  let { todo } = request.body;

  if (!todo) {
    return response.status(400).json({ msg: "Todo not found" });
  }

  todo = (typeof todo === "string") ? todo : JSON.stringify(todo);

  const newTodo = await collection.insertOne({ todo, status: false });

  response.status(201).json({ todo, status: false, _id: newTodo.insertedId });
});

// DELETE
router.delete("/todos/:id", async (request, response) => {
  const collection = getCollection();
  const _id = new ObjectId(request.params.id);

  const deletedTodo = await collection.deleteOne({ _id });

  response.status(200).json(deletedTodo);
});

// PUT
router.put("/todos/:id", async (request, response) => {
  const collection = getCollection();
  const _id = new ObjectId(request.params.id);
  const { status } = request.body;

  if (typeof status !== "boolean") {
    return response.status(400).json({ msg: "Invalid status!" });
  }

  const updatedTodo = await collection.updateOne(
    { _id },
    { $set: { status: !status } }
  );

  response.status(200).json(updatedTodo);
});

module.exports = router;
