const FinanceTransaction = require('../models/FinanceTransaction');
const CommittedIncome = require('../models/CommittedIncome');
const MoneyLent = require('../models/MoneyLent');

// ─── TRANSACTIONS ─────────────────────────────────────────────
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;

    const transactions = await FinanceTransaction.find(filter).sort({ date: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = await FinanceTransaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await FinanceTransaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await FinanceTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// ─── COMMITTED CLIENT INCOME ──────────────────────────────────
exports.getCommittedIncomes = async (req, res, next) => {
  try {
    const items = await CommittedIncome.find().sort({ dueDate: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

exports.createCommittedIncome = async (req, res, next) => {
  try {
    const item = await CommittedIncome.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateCommittedIncome = async (req, res, next) => {
  try {
    const item = await CommittedIncome.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Committed income record not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteCommittedIncome = async (req, res, next) => {
  try {
    const item = await CommittedIncome.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Committed income record not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.markCommittedIncomeReceived = async (req, res, next) => {
  try {
    const item = await CommittedIncome.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Committed income record not found' });
    }

    item.status = 'received';
    item.receivedDate = new Date();
    await item.save();

    // Automatically create an actual Income Transaction
    const transaction = await FinanceTransaction.create({
      type: 'income',
      amount: item.amount,
      category: 'Client Work',
      date: new Date(),
      description: `Payment received from client ${item.clientName} (${item.projectTitle})`,
      paymentMethod: 'bank_transfer',
    });

    res.json({ success: true, data: item, transaction });
  } catch (error) {
    next(error);
  }
};

// ─── MONEY LENT ────────────────────────────────────────────────
exports.getMoneyLent = async (req, res, next) => {
  try {
    const items = await MoneyLent.find().sort({ dateLent: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

exports.createMoneyLent = async (req, res, next) => {
  try {
    const item = await MoneyLent.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateMoneyLent = async (req, res, next) => {
  try {
    const item = await MoneyLent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Money lent record not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteMoneyLent = async (req, res, next) => {
  try {
    const item = await MoneyLent.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Money lent record not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.recordLendRepayment = async (req, res, next) => {
  try {
    const { amountPaid } = req.body;
    const item = await MoneyLent.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Money lent record not found' });
    }

    const newRepaidAmount = (item.repaidAmount || 0) + Number(amountPaid || 0);
    item.repaidAmount = Math.min(item.amount, newRepaidAmount);

    if (item.repaidAmount >= item.amount) {
      item.status = 'repaid';
    } else if (item.repaidAmount > 0) {
      item.status = 'partially_paid';
    }

    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ─── OVERALL FINANCE SUMMARY ───────────────────────────────────
exports.getFinanceSummary = async (req, res, next) => {
  try {
    const transactions = await FinanceTransaction.find();
    const committedIncomes = await CommittedIncome.find({ status: 'pending' });
    const moneyLentItems = await MoneyLent.find({ status: { $ne: 'repaid' } });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else if (t.type === 'expense') totalExpense += t.amount;
    });

    const netBalance = totalIncome - totalExpense;

    const totalCommittedIncome = committedIncomes.reduce((acc, c) => acc + c.amount, 0);
    const totalMoneyLentOutstanding = moneyLentItems.reduce((acc, m) => acc + (m.amount - (m.repaidAmount || 0)), 0);

    const projectedWealth = netBalance + totalCommittedIncome + totalMoneyLentOutstanding;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        totalCommittedIncome,
        totalMoneyLentOutstanding,
        projectedWealth,
        pendingCommittedCount: committedIncomes.length,
        outstandingLentCount: moneyLentItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
