import mailjet from '../lib/mailjetClient.ts';
import * as templates from '../templates/emailTemplates.ts';
import { escapeHTML } from '../lib/sanitizer.ts';
import logger from '../lib/logger.ts';

/**
 * IND Distribution - Transactional Email Service (Mailjet Edition)
 * Handles core email sending logic with Mailjet SDK.
 */

interface SendEmailParams {
  to: string;
  name: string;
  subject: string;
  htmlContent: string;
}

export class EmailService {
  private static fromEmail = process.env.MAIL_FROM_EMAIL || 'musicdistributionindia.in@gmail.com';
  private static fromName = process.env.MAIL_FROM_NAME || 'IND Distribution';
  private static adminEmail = process.env.ADMIN_EMAIL || 'musicdistributionindia.in@gmail.com';

  /**
   * Main send function with Mailjet integration
   */
  public static async sendEmail({ to, name, subject, htmlContent }: SendEmailParams) {
    // Sanitize basic fields
    const safeTo = to?.trim().toLowerCase();
    const safeName = escapeHTML(name || 'Valued Artist');
    const safeSubject = escapeHTML(subject);

    // Validate From Email
    if (!this.fromEmail || !this.fromEmail.includes('@')) {
      logger.error('EmailService: SENDER email is invalid or missing "@"', { fromEmail: this.fromEmail });
      return { success: false, error: 'Misconfigured sender email' };
    }
    if (!safeTo || !safeTo.includes('@')) {
      logger.error('EmailService: Invalid recipient email address', { to: safeTo });
      return { success: false, error: 'Invalid recipient email' };
    }

    if (!mailjet) {
      logger.warn('EmailService: Mailjet client not initialized. Email simulation mode active.', { subject: safeSubject, to: safeTo });
      return { success: true, simulated: true };
    }

    // Inject APP_URL into templates if they contain placeholders (Safe as APP_URL is environment controlled)
    const finalHtml = htmlContent.replace(/{{APP_URL}}/g, process.env.APP_URL || 'https://musicdistributionindia.online');

    try {
      const response = await mailjet.post("send", { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName
            },
            To: [
              {
                Email: safeTo,
                Name: safeName
              }
            ],
            Subject: safeSubject,
            HTMLPart: finalHtml
          }
        ]
      });
      
      logger.info('EmailService: Email sent successfully', { to: safeTo, subject: safeSubject });
      return { success: true, response: response.body };
    } catch (error: any) {
      const errorDetail = error.response?.body || error.message;
      logger.error('EmailService: Failed to send email', { 
        to: safeTo, 
        error: errorDetail,
        statusCode: error.statusCode 
      });
      
      return { success: false, error: errorDetail };
    }
  }

  // --- Specialized Triggers (User-Facing) ---

  public static async sendWelcomeEmail(email: string, name: string) {
    const safeName = escapeHTML(name);
    return this.sendEmail({
      to: email,
      name,
      subject: 'Welcome to IND Distribution 🎵',
      htmlContent: templates.getWelcomeTemplate(safeName),
    });
  }

  public static async sendVerificationEmail(email: string, name: string, otp: string) {
    // OTP is handled as numeric, but let's be safe
    const safeOtp = escapeHTML(otp);
    return this.sendEmail({
      to: email,
      name,
      subject: 'Identity Verification Protocol',
      htmlContent: templates.getVerificationTemplate(safeOtp),
    });
  }

  public static async sendUploadConfirmation(email: string, name: string, songName: string) {
    const safeSongName = escapeHTML(songName);
    return this.sendEmail({
      to: email,
      name,
      subject: `We received your song 🎧: ${safeSongName}`,
      htmlContent: templates.getUploadConfirmationTemplate(safeSongName),
    });
  }

  public static async sendApprovalEmail(email: string, name: string, songName: string) {
    const safeSongName = escapeHTML(songName);
    return this.sendEmail({
      to: email,
      name,
      subject: `Your song is approved ✅: ${safeSongName}`,
      htmlContent: templates.getApprovalTemplate(safeSongName),
    });
  }

  public static async sendRejectionEmail(email: string, name: string, songName: string, reason: string) {
    const safeSongName = escapeHTML(songName);
    const safeReason = escapeHTML(reason);
    return this.sendEmail({
      to: email,
      name,
      subject: `Your song was rejected ❌: ${safeSongName}`,
      htmlContent: templates.getRejectionTemplate(safeSongName, safeReason),
    });
  }

  public static async sendCorrectionRequired(email: string, name: string, songName: string, notes: string) {
    const safeSongName = escapeHTML(songName);
    const safeNotes = escapeHTML(notes);
    return this.sendEmail({
      to: email,
      name,
      subject: `Action Required: Fix your release ⚠️ - ${safeSongName}`,
      htmlContent: templates.getCorrectionRequiredTemplate(safeSongName, safeNotes),
    });
  }

  public static async sendLiveSuccessEmail(email: string, name: string, songName: string) {
    const safeSongName = escapeHTML(songName);
    return this.sendEmail({
      to: email,
      name,
      subject: `Your song is LIVE 🚀: ${safeSongName}`,
      htmlContent: templates.getLiveSuccessTemplate(safeSongName),
    });
  }

  public static async sendRoyaltyAdded(email: string, name: string, amount: string, period: string) {
    const safeAmount = escapeHTML(amount);
    const safePeriod = escapeHTML(period);
    return this.sendEmail({
      to: email,
      name,
      subject: 'You received earnings 💰',
      htmlContent: templates.getRoyaltyAddedTemplate(safeAmount, safePeriod),
    });
  }

  public static async sendWithdrawalApproved(email: string, name: string, amount: string) {
    const safeAmount = escapeHTML(amount);
    return this.sendEmail({
      to: email,
      name,
      subject: 'Withdrawal Approved ✅',
      htmlContent: templates.getWithdrawalApprovedTemplate(safeAmount),
    });
  }

  public static async sendWithdrawalCompleted(email: string, name: string, amount: string, txId: string) {
    const safeAmount = escapeHTML(amount);
    const safeTxId = escapeHTML(txId);
    return this.sendEmail({
      to: email,
      name,
      subject: 'Payment Sent 💸',
      htmlContent: templates.getWithdrawalCompletedTemplate(safeAmount, safeTxId),
    });
  }

  public static async sendRequestSubmittedConfirmation(email: string, name: string, type: string) {
    const safeType = escapeHTML(type);
    return this.sendEmail({
      to: email,
      name,
      subject: 'We received your request',
      htmlContent: templates.getRequestSubmittedTemplate(safeType),
    });
  }

  public static async sendRequestUpdate(email: string, name: string, type: string, status: 'Approved' | 'Rejected' | 'Completed', details?: string) {
    const safeType = escapeHTML(type);
    const safeStatus = escapeHTML(status);
    const safeDetails = details ? escapeHTML(details) : undefined;
    return this.sendEmail({
      to: email,
      name,
      subject: `Request Status Update: ${safeStatus}`,
      htmlContent: templates.getRequestUpdateTemplate(safeType, status, safeDetails),
    });
  }

  // --- Specialized Triggers (Admin-Facing) ---

  public static async notifyAdminNewUpload(userName: string, songName: string) {
    const safeUserName = escapeHTML(userName);
    const safeSongName = escapeHTML(songName);
    return this.sendEmail({
      to: this.adminEmail,
      name: 'System Admin',
      subject: 'New Release Submitted for Review 🎵',
      htmlContent: templates.getAdminNewUploadTemplate(safeUserName, safeSongName),
    });
  }

  public static async notifyAdminWithdrawalRequest(userName: string, amount: string) {
    const safeUserName = escapeHTML(userName);
    const safeAmount = escapeHTML(amount);
    return this.sendEmail({
      to: this.adminEmail,
      name: 'System Admin',
      subject: 'New Withdrawal Requested 💰',
      htmlContent: templates.getAdminWithdrawalRequestTemplate(safeUserName, safeAmount),
    });
  }

  public static async notifyAdminNewRequest(userName: string, type: string) {
    const safeUserName = escapeHTML(userName);
    const safeType = escapeHTML(type);
    return this.sendEmail({
      to: this.adminEmail,
      name: 'System Admin',
      subject: 'New User Request Submitted 🔔',
      htmlContent: `<p>User <strong>${safeUserName}</strong> has submitted a new request: <strong>${safeType}</strong></p>`,
    });
  }
}
