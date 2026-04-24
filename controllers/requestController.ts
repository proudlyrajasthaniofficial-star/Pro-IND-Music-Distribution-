import type { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents.js';

export const submitRequest = async (req: Request, res: Response) => {
  try {
    const { email, name, type } = req.body;
    emailEmitter.emit('REQUEST_SUBMITTED', { email, name, type });
    res.json({ message: 'Request submitted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { email, name, type, status, details } = req.body;
    emailEmitter.emit('REQUEST_UPDATE', { email, name, type, status, details });
    res.json({ message: `Request updated to ${status}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
