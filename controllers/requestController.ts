import type { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents.ts';
import { RequestSubmitSchema, RequestUpdateSchema } from '../lib/validation.ts';
import logger from '../lib/logger.ts';

export const submitRequest = async (req: Request, res: Response) => {
  try {
    const validatedData = RequestSubmitSchema.parse(req.body);
    const { email, name, type } = validatedData;
    emailEmitter.emit('REQUEST_SUBMITTED', { email, name, type });
    
    logger.info("User request submitted", { email, type });
    res.json({ message: 'Request submitted successfully.' });
  } catch (error: any) {
    logger.error("Request submission error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid request data' });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const validatedData = RequestUpdateSchema.parse(req.body);
    const { email, name, type, status, details } = validatedData;
    emailEmitter.emit('REQUEST_UPDATE', { email, name, type, status, details });
    
    logger.info("Request status update triggered", { email, type, status });
    res.json({ message: `Request updated to ${status}.` });
  } catch (error: any) {
    logger.error("Request update error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid request update data' });
  }
};
