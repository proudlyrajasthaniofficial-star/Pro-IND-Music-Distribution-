import { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents';

/**
 * Song Controller Logic
 * Handles status change triggers (Upload, Approval, Rejection, Live).
 */

export const uploadSong = async (req: Request, res: Response) => {
  try {
    const { email, name, songName } = req.body;

    // ... Logic to handle file storage and DB entry ...

    // Trigger Notification
    emailEmitter.emit('SONG_UPLOADED', { email, name, songName });

    res.status(202).json({ message: 'Submission received. Analyzing metadata.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { email, name, songName, status, reason } = req.body;

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

    res.json({ message: `Protocol ${status.toUpperCase()} initiated and artist notified.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { email, name, amount, txId } = req.body;

    // ... Handle payment gateway logic ...

    // Trigger Notification
    emailEmitter.emit('PAYMENT_SUCCESS', { email, name, amount, txId });

    res.json({ message: 'Payment confirmed. Invoice dispatched.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
