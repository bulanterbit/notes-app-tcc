export const validateNoteInput = (req, res, next) => {
  const { title, content } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (!content || content.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }

  next();
};
