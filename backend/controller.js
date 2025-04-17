import express from "express";
import { Note } from "./model.js";
import { validateNoteInput } from "./middleware.js";

const router = express.Router();

// Get all notes
router.get("/notes", async (req, res, next) => {
  try {
    const notes = await Note.find();
    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

// Get a single note
router.get("/notes/:id", async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }
    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Create a new note
router.post("/notes", validateNoteInput, async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({
      title,
      content,
      tags,
    });
    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Update a note
router.put("/notes/:id", validateNoteInput, async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findByIdAndUpdate(req.params.id, {
      title,
      content,
      tags,
    });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }
    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a note
router.delete("/notes/:id", async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }
    res.status(200).json({
      success: true,
      data: {},
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
