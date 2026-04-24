import { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents';

export const addRoyalty = async (req: Request, res: Response) => {
  try {
    const { email, name, amount, period } = req.body;
    emailEmitter.emit('ROYALTY_ADDED', { email, name, amount, period });
    res.json({ message: 'Royalty added and user notified.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const { email, name, amount } = req.body;
    emailEmitter.emit('WITHDRAWAL_REQUESTED', { email, name, amount });
    res.json({ message: 'Withdrawal requested. Admin notified.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const { email, name, amount, status, txId } = req.body;
    if (status === 'approved') {
      emailEmitter.emit('WITHDRAWAL_APPROVED', { email, name, amount });
    } else if (status === 'completed') {
      emailEmitter.emit('WITHDRAWAL_COMPLETED', { email, name, amount, txId });
    }
    res.json({ message: `Withdrawal ${status} and user notified.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
