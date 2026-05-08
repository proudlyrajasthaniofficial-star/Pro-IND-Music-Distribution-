import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export const SongUploadSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  songName: z.string().min(1).max(200),
});

export const SongStatusUpdateSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  songName: z.string(),
  status: z.enum(['approved', 'rejected', 'correction_required', 'live']),
  reason: z.string().optional(),
});

export const PaymentSuccessSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  amount: z.string(),
  txId: z.string().min(1),
});

export const RoyaltySchema = z.object({
  email: z.string().email(),
  name: z.string(),
  amount: z.string(),
  period: z.string(),
});

export const WithdrawalSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  amount: z.string(),
});

export const WithdrawalStatusSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  amount: z.string(),
  status: z.enum(['approved', 'completed']),
  txId: z.string().optional(),
});

export const RequestSubmitSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  type: z.string(),
});

export const RequestUpdateSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  type: z.string(),
  status: z.enum(['Approved', 'Rejected', 'Completed']),
  details: z.string().optional(),
});
