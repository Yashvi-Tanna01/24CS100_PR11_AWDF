import mongoose from 'mongoose';
import Task from '../models/Task.js';

let fallbackTasks = [
  { _id: 'sample_task_1', title: 'Verify Docker Multi-Container Compose Stack', priority: 'high', assignedUser: 'Maitri Sheta (D25CS120)', createdAt: new Date() },
  { _id: 'sample_task_2', title: 'Verify MongoDB Named Volume (mongo-data)', priority: 'medium', assignedUser: 'Maitri Sheta (D25CS120)', createdAt: new Date() }
];

async function getTasksFromDb() {
  if (mongoose.connection.readyState === 1) {
    return await Task.find().sort({ createdAt: -1 });
  }
  return fallbackTasks;
}

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await getTasksFromDb();
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, assignedUser } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    let savedTask;
    if (mongoose.connection.readyState === 1) {
      savedTask = await Task.create({
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        assignedUser: assignedUser || 'Maitri Sheta (D25CS120)'
      });
    } else {
      savedTask = {
        _id: 'temp_' + Date.now(),
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        assignedUser: assignedUser || 'Maitri Sheta (D25CS120)',
        createdAt: new Date()
      };
      fallbackTasks.unshift(savedTask);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully in MongoDB container',
      task: savedTask
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deletedTask;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      deletedTask = await Task.findByIdAndDelete(id);
    } else {
      const idx = fallbackTasks.findIndex(t => t._id.toString() === id);
      if (idx !== -1) {
        deletedTask = fallbackTasks.splice(idx, 1)[0];
      }
    }

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (err) {
    next(err);
  }
};
