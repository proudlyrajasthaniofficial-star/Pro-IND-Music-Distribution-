import type { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents.ts';
import { SongUploadSchema, SongStatusUpdateSchema, PaymentSuccessSchema } from '../lib/validation.ts';
import logger from '../lib/logger.ts';

/**
 * Song Controller Logic
 * Handles status change triggers (Upload, Approval, Rejection, Live).
 */

export const uploadSong = async (req: Request, res: Response) => {
  try {
    const validatedData = SongUploadSchema.parse(req.body);
    const { email, name, songName } = validatedData;

    // Trigger Notification
    emailEmitter.emit('SONG_UPLOADED', { email, name, songName });

    logger.info("Song upload event triggered", { email, songName });
    res.status(202).json({ message: 'Submission received. Analyzing metadata.' });
  } catch (error: any) {
    logger.error("Song upload error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid upload data' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const validatedData = SongStatusUpdateSchema.parse(req.body);
    const { email, name, songName, status, reason } = validatedData;

    // Trigger Notifications based on status
    switch (status) {
      case 'approved':
        emailEmitter.emit('SONG_APPROVED', { email, name, songName });
        break;
      case 'rejected':
        emailEmitter.emit('SONG_REJECTED', { email, name, songName, reason });
        break;
      case 'correction_required':
        emailEmitter.emit('CORRECTION_REQUIRED', { email, name, songName, notes: reason });
        break;
      case 'live':
        emailEmitter.emit('SONG_LIVE', { email, name, songName });
        break;
    }

    logger.info("Song status update triggered", { email, songName, status });
    res.json({ message: `Protocol ${status.toUpperCase()} initiated and artist notified.` });
  } catch (error: any) {
    logger.error("Status update error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid status update data' });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = PaymentSuccessSchema.parse(req.body);
    const { email, name, amount, txId } = validatedData;

    // Trigger Notification
    emailEmitter.emit('PAYMENT_SUCCESS', { email, name, amount, txId });

    logger.info("Payment success event triggered", { email, amount, txId });
    res.json({ message: 'Payment confirmed. Invoice dispatched.' });
  } catch (error: any) {
    logger.error("Payment processing error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid payment data' });
  }
};
