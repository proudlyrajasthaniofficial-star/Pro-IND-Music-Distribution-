import type { Request, Response } from 'express';
import emailEmitter from '../events/emailEvents.ts';
import { SignupSchema, VerifyEmailSchema } from '../lib/validation.ts';
import logger from '../lib/logger.ts';

/**
 * User Controller Logic
 * Handles signup and verification triggers.
 */

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = SignupSchema.parse(req.body);
    const { email, name } = validatedData;

    // Trigger Notification
    emailEmitter.emit('USER_SIGNUP', { email, name });

    logger.info("User signup successful", { email });
    res.status(201).json({ message: 'User created and welcome email dispatched.' });
  } catch (error: any) {
    logger.error("Signup error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid signup data' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const validatedData = VerifyEmailSchema.parse(req.body);
    const { email, name } = validatedData;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Trigger Notification
    emailEmitter.emit('VERIFY_EMAIL', { email, name, otp });

    logger.info("Verification email triggered", { email });
    res.json({ message: 'Verification protocol initiated.' });
  } catch (error: any) {
    logger.error("Verification error", { error: error.errors || error.message });
    res.status(400).json({ error: error.errors || 'Invalid verification data' });
  }
};
