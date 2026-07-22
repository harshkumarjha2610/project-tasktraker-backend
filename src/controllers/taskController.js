const mongoose = require('mongoose');
const Task = require('../models/Task');

// Helper: is this a valid MongoDB ObjectId?
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const invalidIdResponse = (res) =>
  res.status(400).json({ success: false, message: 'Invalid task ID. Must be a valid MongoDB ObjectId.' });

// ─── GET /api/tasks ────────────────────────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const {
      status, priority, category,
      search, sort = '-createdAt',
      limit = 50, page = 1,
    } = req.query;

    const filter = {
      $or: [
        { isDeleted: { $ne: true } },
        { status: 'done' } // Return done tasks even if soft-deleted
      ]
    };
    
    if (status   && status   !== 'all') filter.status   = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;

    const finalFilter = search ? {
      $and: [
        filter,
        {
          $or: [
            { title:       { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags:        { $in: [new RegExp(search, 'i')] } },
          ]
        }
      ]
    } : filter;

    const skip = (Number(page) - 1) * Number(limit);

    const [tasks, total] = await Promise.all([
      Task.find(finalFilter).sort(sort).skip(skip).limit(Number(limit)),
      Task.countDocuments(finalFilter),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/stats ──────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const statsFilter = {
      $or: [
        { isDeleted: { $ne: true } },
        { status: 'done' }
      ]
    };
    const [byStatus, byPriority, byCategory, deletedIncompleteCount, doneTasks] = await Promise.all([
      Task.aggregate([{ $match: statsFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: statsFilter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: statsFilter }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      Task.countDocuments({ isDeleted: true, status: { $ne: 'done' } }),
      Task.find({ $and: [statsFilter, { status: 'done', completedAt: { $ne: null } }] })
    ]);

    const toMap = (arr) => arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

    const statusMap   = toMap(byStatus);
    const priorityMap = toMap(byPriority);
    const categoryMap = toMap(byCategory);
    const total       = Object.values(statusMap).reduce((s, v) => s + v, 0);

    let completedOnTime = 0;
    let completedBeforeTime = 0;
    let completedAfterTime = 0;
    let totalTimeSaved = 0;
    let totalTimeWasted = 0;

    // Day-wise completion for last 7 days (IST)
    const dayWiseMap = {};
    const today = new Date();
    const todayIST = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    todayIST.setHours(23, 59, 59, 999); // 11:59:59 PM IST (End of day)

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayIST);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayWiseMap[dayName] = { day: dayName, completed: 0, added: 0 };
    }

    doneTasks.forEach(task => {
      // Convert completedAt to IST Date object (where .getHours() etc. return IST values)
      const compDate = new Date(new Date(task.completedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      
      // Timing stats
      if (task.dueDate) {
        // Since dueDate now includes time (e.g. 23:59), we compare exact dates in IST
        const dueDate = new Date(new Date(task.dueDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        
        // Calculate the difference in hours
        const timeDiffHours = (dueDate.getTime() - compDate.getTime()) / (1000 * 60 * 60);
        
        if (timeDiffHours > 0) {
          totalTimeSaved += timeDiffHours;
        } else if (timeDiffHours < 0) {
          totalTimeWasted += Math.abs(timeDiffHours);
        }

        if (timeDiffHours >= 4) {
          completedBeforeTime++;
        } else if (timeDiffHours < 0) {
          completedAfterTime++;
        } else {
          completedOnTime++;
        }
      }
      
      // Day-wise stats
      const diffTime = todayIST.getTime() - compDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 6) {
        const dayName = compDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayWiseMap[dayName]) dayWiseMap[dayName].completed++;
      }
    });

    res.json({
      success: true,
      data: {
        total,
        done:       statusMap.done       ?? 0,
        inProgress: statusMap.inprogress ?? 0,
        todo:       statusMap.todo       ?? 0,
        overdue:    await Task.countDocuments({ isDeleted: { $ne: true }, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
        byPriority: priorityMap,
        byCategory: categoryMap,
        completedOnTime,
        completedBeforeTime,
        completedAfterTime,
        totalTimeSaved: Math.round(totalTimeSaved * 10) / 10, // Round to 1 decimal
        totalTimeWasted: Math.round(totalTimeWasted * 10) / 10,
        deletedWithoutCompletion: deletedIncompleteCount,
        dayWise: Object.values(dayWiseMap)
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/:id ────────────────────────────────────────
const getTask = async (req, res, next) => {
  if (!isValidId(req.params.id)) return invalidIdResponse(res);
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tasks ───────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/tasks/:id ────────────────────────────────────────
const updateTask = async (req, res, next) => {
  if (!isValidId(req.params.id)) return invalidIdResponse(res);
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    Object.assign(task, req.body);
    await task.save(); // triggers pre-save hook for completedAt
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/tasks/:id/toggle ──────────────────────────────
const toggleTask = async (req, res, next) => {
  if (!isValidId(req.params.id)) return invalidIdResponse(res);
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = task.status === 'done' ? 'todo' : 'done';
    await task.save();
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks/:id ─────────────────────────────────────
const deleteTask = async (req, res, next) => {
  if (!isValidId(req.params.id)) return invalidIdResponse(res);
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.isDeleted = true;
    await task.save();
    res.json({ success: true, message: 'Task deleted', data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks (bulk) ──────────────────────────────────
const deleteManyTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide an array of task IDs' });
    }

    // Filter to only valid ObjectIds
    const validIds = ids.filter(id => isValidId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid task IDs provided' });
    }

    const result = await Task.updateMany({ _id: { $in: validIds } }, { $set: { isDeleted: true } });
    res.json({ success: true, message: `${result.modifiedCount} task(s) deleted` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getStats, getTask, createTask, updateTask, toggleTask, deleteTask, deleteManyTasks };
