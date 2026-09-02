const Pomodoro = require('../models/Pomodoro');

// Helper to get or create the global pomodoro store document
const getOrCreatePomodoroStore = async () => {
  let store = await Pomodoro.findOne({ key: 'global_pomodoro_store' });
  if (!store) {
    store = await Pomodoro.create({ key: 'global_pomodoro_store' });
  }
  return store;
};

// GET /api/pomodoro
exports.getPomodoroData = async (req, res, next) => {
  try {
    const store = await getOrCreatePomodoroStore();
    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pomodoro/settings
exports.updatePomodoroSettings = async (req, res, next) => {
  try {
    const { settings, colorTheme, bgStyle } = req.body;
    const store = await getOrCreatePomodoroStore();

    if (settings) store.settings = { ...store.settings.toObject(), ...settings };
    if (colorTheme) store.colorTheme = colorTheme;
    if (bgStyle) store.bgStyle = bgStyle;

    await store.save();

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pomodoro/session
exports.addPomodoroSession = async (req, res, next) => {
  try {
    const { session } = req.body;
    if (!session || !session.id || !session.mode || !session.durationMinutes || !session.completedAt) {
      return res.status(400).json({ success: false, message: 'Invalid session payload' });
    }

    const store = await getOrCreatePomodoroStore();
    // Avoid duplicate session entry by id
    const existingIndex = store.history.findIndex(s => s.id === session.id);
    if (existingIndex === -1) {
      store.history.unshift(session);
      await store.save();
    }

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pomodoro/waste
exports.addWasteSession = async (req, res, next) => {
  try {
    const { wasteRecord } = req.body;
    if (!wasteRecord || !wasteRecord.id || !wasteRecord.mode || !wasteRecord.durationSeconds || !wasteRecord.interruptedAt) {
      return res.status(400).json({ success: false, message: 'Invalid waste record payload' });
    }

    const store = await getOrCreatePomodoroStore();
    // Avoid duplicate entry by id
    const existingIndex = store.wasteHistory.findIndex(w => w.id === wasteRecord.id);
    if (existingIndex === -1) {
      store.wasteHistory.unshift(wasteRecord);
      await store.save();
    }

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pomodoro/sync
exports.syncPomodoroData = async (req, res, next) => {
  try {
    const { settings, colorTheme, bgStyle, history, wasteHistory } = req.body;
    const store = await getOrCreatePomodoroStore();

    if (settings) store.settings = { ...store.settings.toObject(), ...settings };
    if (colorTheme) store.colorTheme = colorTheme;
    if (bgStyle) store.bgStyle = bgStyle;

    if (Array.isArray(history) && history.length > 0) {
      // Merge items by id
      const existingIds = new Set(store.history.map(h => h.id));
      for (const item of history) {
        if (!existingIds.has(item.id)) {
          store.history.push(item);
          existingIds.add(item.id);
        }
      }
      // Sort history descending by completedAt
      store.history.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }

    if (Array.isArray(wasteHistory) && wasteHistory.length > 0) {
      // Merge items by id
      const existingIds = new Set(store.wasteHistory.map(w => w.id));
      for (const item of wasteHistory) {
        if (!existingIds.has(item.id)) {
          store.wasteHistory.push(item);
          existingIds.add(item.id);
        }
      }
      // Sort waste history descending by interruptedAt
      store.wasteHistory.sort((a, b) => new Date(b.interruptedAt).getTime() - new Date(a.interruptedAt).getTime());
    }

    await store.save();

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pomodoro/history
exports.clearPomodoroHistory = async (req, res, next) => {
  try {
    const { type } = req.query; // 'history' | 'waste' | 'all'
    const store = await getOrCreatePomodoroStore();

    if (type === 'history') {
      store.history = [];
    } else if (type === 'waste') {
      store.wasteHistory = [];
    } else {
      store.history = [];
      store.wasteHistory = [];
    }

    await store.save();

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pomodoro/active-timer
exports.updateActiveTimer = async (req, res, next) => {
  try {
    const { activeTimer } = req.body;
    const store = await getOrCreatePomodoroStore();

    if (activeTimer) {
      store.activeTimer = {
        ...store.activeTimer.toObject(),
        ...activeTimer,
        updatedAt: Date.now(),
      };
      await store.save();
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pomodoro/standalone-waste
exports.updateStandaloneWaste = async (req, res, next) => {
  try {
    const { standaloneWasteState } = req.body;
    const store = await getOrCreatePomodoroStore();

    if (standaloneWasteState) {
      store.standaloneWasteState = {
        ...store.standaloneWasteState.toObject(),
        ...standaloneWasteState,
        updatedAt: Date.now(),
      };
      await store.save();
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

