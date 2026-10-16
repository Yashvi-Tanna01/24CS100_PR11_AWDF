import mongoose from 'mongoose';

export const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: `Invalid resource ID format: "${id}". Must be a valid 24-hex character MongoDB ObjectId.`
    });
  }

  req.taskId = id;
  next();
};
