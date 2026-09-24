const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Summary
router.get('/summary', financeController.getFinanceSummary);

// Transactions
router.get('/transactions', financeController.getTransactions);
router.post('/transactions', financeController.createTransaction);
router.put('/transactions/:id', financeController.updateTransaction);
router.delete('/transactions/:id', financeController.deleteTransaction);

// Committed Client Income
router.get('/committed-income', financeController.getCommittedIncomes);
router.post('/committed-income', financeController.createCommittedIncome);
router.put('/committed-income/:id', financeController.updateCommittedIncome);
router.delete('/committed-income/:id', financeController.deleteCommittedIncome);
router.patch('/committed-income/:id/mark-received', financeController.markCommittedIncomeReceived);

// Money Lent
router.get('/money-lent', financeController.getMoneyLent);
router.post('/money-lent', financeController.createMoneyLent);
router.put('/money-lent/:id', financeController.updateMoneyLent);
router.delete('/money-lent/:id', financeController.deleteMoneyLent);
router.patch('/money-lent/:id/repay', financeController.recordLendRepayment);

module.exports = router;
