const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

const getTasks = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');

      filter = {
        project: { $in: userProjects.map(project => project._id) },
      };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const isMember = proj.members.some(m => m.toString() === req.user._id.toString());
    const isOwner = proj.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || req.user._id,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    await task.populate([
      { path: 'project', select: 'title' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin') {
      const canAccess =
        task.assignedTo?._id?.toString() === req.user._id.toString() ||
        task.createdBy?._id?.toString() === req.user._id.toString() ||
        (await Project.exists({
          _id: task.project._id,
          $or: [{ owner: req.user._id }, { members: req.user._id }],
        }));

      if (!canAccess) {
        return res.status(403).json({ message: 'Not authorized to view this task' });
      }
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
    const isCreator = task.createdBy?.toString() === req.user._id.toString();

    if (!isAssignee && !isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { createdBy, ...updates } = req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      const canAccess = await Project.exists({
        _id: req.params.projectId,
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      });

      if (!canAccess) {
        return res.status(403).json({ message: 'Not authorized to view these tasks' });
      }
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!req.body.text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    task.comments.push({ user: req.user._id, text: req.body.text.trim() });
    await task.save();
    await task.populate('comments.user', 'name');

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  addComment,
};
