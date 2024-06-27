const express = require("express");
const router = express.Router();
const { getConnectedClient } = require("./database");

// GET
router.get("/todos", (request, response) => {
  response.status(200).json({ msg: "GET Request to /api/todos" });
});

// POST
router.post("/todos", (request, response) => {
  response.status(201).json({ msg: "POST Request to /api/todos" });
});

// DELETE
router.delete("/todos/:id", (request, response) => {
  response.status(200).json({ msg: "DELETE Request to /api/todos/:id" });
});

// PUT
router.put("/todos/:id", (request, response) => {
  response.status(200).json({ msg: "PUT Request to /api/todos/:id" });
});

module.exports = router;
