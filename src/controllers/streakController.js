const Streak = require('../models/Streak');

function getDaysBetween(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return Infinity;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

// GET streak record
exports.getStreak = async (req, res, next) => {
  try {
    let streak = await Streak.findOne({ userId: 'default_user' });
    if (!streak) {
      streak = await Streak.create({ userId: 'default_user' });
    }
    res.json({ success: true, data: streak });
  } catch (error) {
    next(error);
  }
};

// POST record visit for today
exports.recordVisit = async (req, res, next) => {
  try {
    const todayStr = req.body.dateStr || new Date().toISOString().split('T')[0];
    let streak = await Streak.findOne({ userId: 'default_user' });

    if (!streak) {
      streak = new Streak({ userId: 'default_user' });
    }

    const lastDate = streak.lastActiveDate;

    if (lastDate === todayStr) {
      // Already logged today
      return res.json({ success: true, data: streak, message: 'Already recorded visit for today' });
    }

    const diffDays = getDaysBetween(lastDate, todayStr);

    if (!lastDate || diffDays > 1 || diffDays < 0) {
      // Missing or missed day(s) -> reset streak to 1
      streak.currentStreak = 1;
    } else if (diffDays === 1) {
      // Yesterday -> increment streak by 1
      streak.currentStreak = (streak.currentStreak || 0) + 1;
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = todayStr;
    if (!streak.activeDates.includes(todayStr)) {
      streak.activeDates.push(todayStr);
      streak.totalDaysActive = streak.activeDates.length;
    }

    await streak.save();
    res.json({ success: true, data: streak });
  } catch (error) {
    next(error);
  }
};

// PUT sync complete streak state
exports.syncStreak = async (req, res, next) => {
  try {
    const { currentStreak, longestStreak, lastActiveDate, activeDates, totalDaysActive } = req.body;
    let streak = await Streak.findOne({ userId: 'default_user' });

    if (!streak) {
      streak = new Streak({ userId: 'default_user' });
    }

    if (currentStreak !== undefined) streak.currentStreak = currentStreak;
    if (longestStreak !== undefined) streak.longestStreak = longestStreak;
    if (lastActiveDate !== undefined) streak.lastActiveDate = lastActiveDate;
    if (Array.isArray(activeDates)) streak.activeDates = Array.from(new Set(activeDates));
    if (totalDaysActive !== undefined) streak.totalDaysActive = totalDaysActive;
    else if (streak.activeDates) streak.totalDaysActive = streak.activeDates.length;

    await streak.save();
    res.json({ success: true, data: streak });
  } catch (error) {
    next(error);
  }
};
