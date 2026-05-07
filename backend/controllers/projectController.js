const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const io = req.app.get("socketio");
    if (!title) return res.status(400).json({ message: "Title required" });

    const validMembers = members
      ? await User.find({ _id: { $in: members } }).select("_id")
      : [];
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: validMembers.map((member) => member._id),
    });

    // --- REAL-TIME EMIT ---
    io.emit("project_created");
    io.emit("new_notification", {
      title: "New Project Launched",
      message: `A new project "${title}" has been added to the workspace.`,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getProjects = async (req, res) => {
  try {
    const query =
      req.user.role === "Admin"
        ? {}
        : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };
    const projects = await Project.find(query)
      .populate("createdBy", "name")
      .populate("members", "name");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Fetch error" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("members", "name");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Fetch error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const io = req.app.get("socketio");
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) {
      const validMembers = await User.find({ _id: { $in: members } }).select(
        "_id",
      );
      project.members = validMembers.map((member) => member._id);
    }

    await project.save();
    io.emit("project_updated");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Update error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    await project.remove();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
