import { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents';

/**
 * User Controller Logic
 * Handles signup and verification triggers.
 */

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    // ... Logic to save user to DB (Firebase/PostgreSQL etc) ...

    // Trigger Notification
    emailEmitter.emit('USER_SIGNUP', { email, name });

    res.status(201).json({ message: 'User created and welcome email dispatched.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ... Store OTP in session/DB ...

    // Trigger Notification
    emailEmitter.emit('VERIFY_EMAIL', { email, name, otp });

    res.json({ message: 'Verification protocol initiated.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
