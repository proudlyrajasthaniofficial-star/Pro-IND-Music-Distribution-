import type { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents.ts';
import { RoyaltySchema, WithdrawalSchema, WithdrawalStatusSchema } from '../lib/validation.ts';
import logger from '../lib/logger.ts';

export const addRoyalty = async (req: Request, res: Response) => {
  try {
    const validatedData = RoyaltySchema.parse(req.body);
    const { email, name, amount, period } = validatedData;
    emailEmitter.emit('ROYALTY_ADDED', { email, name, amount, period });
    
    logger.info("Royalty added triggered", { email, amount, period });
    res.json({ message: 'Royalty added and user notified.' });
  } catch (error: any) {
    logger.error("Add royalty error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid royalty data' });
  }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const validatedData = WithdrawalSchema.parse(req.body);
    const { email, name, amount } = validatedData;
    emailEmitter.emit('WITHDRAWAL_REQUESTED', { email, name, amount });
    
    logger.info("Withdrawal request triggered", { email, amount });
    res.json({ message: 'Withdrawal requested. Admin notified.' });
  } catch (error: any) {
    logger.error("Withdrawal request error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid withdrawal data' });
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const validatedData = WithdrawalStatusSchema.parse(req.body);
    const { email, name, amount, status, txId } = validatedData;
    if (status === 'approved') {
      emailEmitter.emit('WITHDRAWAL_APPROVED', { email, name, amount });
    } else if (status === 'completed') {
      emailEmitter.emit('WITHDRAWAL_COMPLETED', { email, name, amount, txId: txId || 'N/A' });
    }

    logger.info("Withdrawal status update triggered", { email, amount, status });
    res.json({ message: `Withdrawal ${status} and user notified.` });
  } catch (error: any) {
    logger.error("Withdrawal status update error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid withdrawal status data' });
  }
};
