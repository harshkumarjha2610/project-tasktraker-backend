const JobTracker = require('../models/JobTracker');

// GET all job applications
exports.getJobs = async (req, res, next) => {
  try {
    const { status, platform, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (platform && platform !== 'all') {
      query.platform = platform;
    }
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await JobTracker.find(query).sort({ appliedDate: -1, createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

// CREATE job application
exports.createJob = async (req, res, next) => {
  try {
    const job = await JobTracker.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// UPDATE job application
exports.updateJob = async (req, res, next) => {
  try {
    const job = await JobTracker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application record not found' });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// DELETE job application
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await JobTracker.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application record not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
