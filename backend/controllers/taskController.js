const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, project, assignedTo } =
      req.body;
    const io = req.app.get("socketio"); // Get IO instance

    if (!title || !project || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Title, project, and assignedTo are required" });
    }

    if (
      !mongoose.isValidObjectId(project) ||
      !mongoose.isValidObjectId(assignedTo)
    ) {
      return res.status(400).json({ message: "Invalid ObjectIds provided" });
    }

    const existingProject = await Project.findById(project);
    if (!existingProject)
      return res.status(404).json({ message: "Project not found" });

    const assignee = await User.findById(assignedTo);
    if (!assignee)
      return res.status(404).json({ message: "Assigned user not found" });

    const task = await Task.create({
      title,
      description,
      status: status || "Pending",
      dueDate,
      project,
      assignedTo,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedTo", "name");

    // --- REAL-TIME EMIT ---
    io.emit("task_created"); // Refresh Dashboard/Tasks lists
    if (assignee.role === "Member") {
      io.to(assignee._id.toString()).emit("new_notification", {
        title: "New Task Assigned",
        message: `A task was assigned to you: ${title}`,
        taskId: task._id,
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTasks = async (req, res) => {
  try {
    const { project, assignedTo, status, sort } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (req.user.role === "Admin") {
      if (assignedTo) filter.assignedTo = assignedTo;
    } else {
      filter.assignedTo = req.user._id;
    }
    let query = Task.find(filter)
      .populate("project", "title description")
      .populate("assignedTo", "name email role");
    if (sort === "dueDateAsc") query = query.sort({ dueDate: 1 });
    const tasks = await query;
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Fetch error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title")
      .populate("assignedTo", "name");
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (
      req.user.role !== "Admin" &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const io = req.app.get("socketio");
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      req.user.role !== "Admin" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { title, description, status, dueDate, project, assignedTo } =
      req.body;
    const previousAssignedTo = task.assignedTo?.toString();

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (project !== undefined) task.project = project;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const savedTask = await task.save();
    const updated = await Task.findById(savedTask._id)
      .populate("project", "title")
      .populate("assignedTo", "name role");

    // --- REAL-TIME EMIT ---
    io.emit("task_updated"); // Sync all screens

    if (assignedTo && assignedTo.toString() !== previousAssignedTo) {
      const newAssignee = await User.findById(assignedTo);
      if (newAssignee?.role === "Member") {
        io.to(assignedTo.toString()).emit("new_notification", {
          title: "Task Reassigned",
          message: `A task has been reassigned to you: ${task.title}`,
          taskId: task._id,
        });
      }
    }

    if (status && updated.assignedTo?.role === "Member") {
      io.to(updated.assignedTo._id.toString()).emit("new_notification", {
        title: "Task Status Changed",
        message: `Task "${task.title}" is now ${status}.`,
        taskId: task._id,
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.remove();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete error" });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
