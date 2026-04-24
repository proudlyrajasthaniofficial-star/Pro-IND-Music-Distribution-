import { EventEmitter } from 'events';
import { EmailService } from '../services/emailService';

/**
 * IND Distribution - Global Event Bus for Notifications
 * Decouples controllers from the email service for better scalability.
 */

const emailEmitter = new EventEmitter();

// --- Event Handlers ---

emailEmitter.on('USER_SIGNUP', async ({ email, name }) => {
  await EmailService.sendWelcomeEmail(email, name);
});

emailEmitter.on('VERIFY_EMAIL', async ({ email, name, otp }) => {
  await EmailService.sendVerificationEmail(email, name, otp);
});

emailEmitter.on('SONG_UPLOADED', async ({ email, name, songName }) => {
  await EmailService.sendUploadConfirmation(email, name, songName);
  await EmailService.notifyAdminNewUpload(name, songName);
});

emailEmitter.on('SONG_APPROVED', async ({ email, name, songName }) => {
  await EmailService.sendApprovalEmail(email, name, songName);
});

emailEmitter.on('SONG_REJECTED', async ({ email, name, songName, reason }) => {
  await EmailService.sendRejectionEmail(email, name, songName, reason);
});

emailEmitter.on('CORRECTION_REQUIRED', async ({ email, name, songName, notes }) => {
  await EmailService.sendCorrectionRequired(email, name, songName, notes);
});

emailEmitter.on('PAYMENT_SUCCESS', async ({ email, name, amount, txId }) => {
  // Mapping current payment success to generic sendEmail if template was removed/changed
  await EmailService.sendEmail({
    to: email,
    name,
    subject: 'Transaction Confirmed - IND Distribution',
    htmlContent: `<h2>Payment Received</h2><p>Amount: ${amount}</p><p>ID: ${txId}</p>`
  });
});

emailEmitter.on('SONG_LIVE', async ({ email, name, songName }) => {
  await EmailService.sendLiveSuccessEmail(email, name, songName);
});

// Finance Events
emailEmitter.on('ROYALTY_ADDED', async ({ email, name, amount, period }) => {
  await EmailService.sendRoyaltyAdded(email, name, amount, period);
});

emailEmitter.on('WITHDRAWAL_REQUESTED', async ({ email, name, amount }) => {
  await EmailService.notifyAdminWithdrawalRequest(name, amount);
});

emailEmitter.on('WITHDRAWAL_APPROVED', async ({ email, name, amount }) => {
  await EmailService.sendWithdrawalApproved(email, name, amount);
});

emailEmitter.on('WITHDRAWAL_COMPLETED', async ({ email, name, amount, txId }) => {
  await EmailService.sendWithdrawalCompleted(email, name, amount, txId);
});

// Request System Events
emailEmitter.on('REQUEST_SUBMITTED', async ({ email, name, type }) => {
  await EmailService.sendRequestSubmittedConfirmation(email, name, type);
  await EmailService.notifyAdminNewRequest(name, type);
});

emailEmitter.on('REQUEST_UPDATE', async ({ email, name, type, status, details }) => {
  await EmailService.sendRequestUpdate(email, name, type, status, details);
});

export default emailEmitter;
