import mailjet from '../lib/mailjetClient.ts';
import * as templates from '../templates/emailTemplates.ts';

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
    // Validate From Email
    if (!this.fromEmail || !this.fromEmail.includes('@')) {
      console.error('❌ [EmailService] SENDER email is invalid or missing "@":', this.fromEmail);
      return { success: false, error: 'Misconfigured sender email' };
    }
    if (!to || !to.includes('@')) {
      console.error('❌ [EmailService] Invalid recipient email address:', to);
      return { success: false, error: 'Invalid recipient email' };
    }

    if (!mailjet) {
      console.warn('⚠️ [EmailService] Mailjet client not initialized. Email simulation mode active.');
      console.log(`[SIMULATION] Sending "${subject}" to ${name} (${to})`);
      return { success: true, simulated: true };
    }

    // Inject APP_URL into templates if they contain placeholders
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
                Email: to,
                Name: name || 'Valued Artist'
              }
            ],
            Subject: subject,
            HTMLPart: finalHtml
          }
        ]
      });
      
      console.log(`✅ [EmailService] Email sent to ${to}`);
      return { success: true, response: response.body };
    } catch (error: any) {
      const errorDetail = error.response?.body || error.message;
      console.error(`❌ [EmailService] Failed to send email to ${to}:`, JSON.stringify(errorDetail, null, 2));
      
      if (error.statusCode === 400) {
        console.warn('💡 [Tip] Status Code 400 often means the "From" email is not verified in your Mailjet account or the request body is malformed.');
      }
      
      return { success: false, error: errorDetail };
    }
  }

  // --- Specialized Triggers (User-Facing) ---

  public static async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: 'Welcome to IND Distribution 🎵',
      htmlContent: templates.getWelcomeTemplate(name),
    });
  }

  public static async sendVerificationEmail(email: string, name: string, otp: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: 'Identity Verification Protocol',
      htmlContent: templates.getVerificationTemplate(otp),
    });
  }

  public static async sendUploadConfirmation(email: string, name: string, songName: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: `We received your song 🎧: ${songName}`,
      htmlContent: templates.getUploadConfirmationTemplate(songName),
    });
  }

  public static async sendApprovalEmail(email: string, name: string, songName: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: `Your song is approved ✅: ${songName}`,
      htmlContent: templates.getApprovalTemplate(songName),
    });
  }

  public static async sendRejectionEmail(email: string, name: string, songName: string, reason: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: `Your song was rejected ❌: ${songName}`,
      htmlContent: templates.getRejectionTemplate(songName, reason),
    });
  }

  public static async sendCorrectionRequired(email: string, name: string, songName: string, notes: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: `Action Required: Fix your release ⚠️ - ${songName}`,
      htmlContent: templates.getCorrectionRequiredTemplate(songName, notes),
    });
  }

  public static async sendLiveSuccessEmail(email: string, name: string, songName: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: `Your song is LIVE 🚀: ${songName}`,
      htmlContent: templates.getLiveSuccessTemplate(songName),
    });
  }

  public static async sendRoyaltyAdded(email: string, name: string, amount: string, period: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: 'You received earnings 💰',
      htmlContent: templates.getRoyaltyAddedTemplate(amount, period),
    });
  }

  public static async sendWithdrawalApproved(email: string, name: string, amount: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: 'Withdrawal Approved ✅',
      htmlContent: templates.getWithdrawalApprovedTemplate(amount),
    });
  }

  public static async sendWithdrawalCompleted(email: string, name: string, amount: string, txId: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: 'Payment Sent 💸',
      htmlContent: templates.getWithdrawalCompletedTemplate(amount, txId),
    });
  }

  public static async sendRequestSubmittedConfirmation(email: string, name: string, type: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: 'We received your request',
      htmlContent: templates.getRequestSubmittedTemplate(type),
    });
  }

  public static async sendRequestUpdate(email: string, name: string, type: string, status: 'Approved' | 'Rejected' | 'Completed', details?: string) {
    return this.sendEmail({
      to: email,
      name,
      subject: `Request Status Update: ${status}`,
      htmlContent: templates.getRequestUpdateTemplate(type, status, details),
    });
  }

  // --- Specialized Triggers (Admin-Facing) ---

  public static async notifyAdminNewUpload(userName: string, songName: string) {
    return this.sendEmail({
      to: this.adminEmail,
      name: 'System Admin',
      subject: 'New Release Submitted for Review 🎵',
      htmlContent: templates.getAdminNewUploadTemplate(userName, songName),
    });
  }

  public static async notifyAdminWithdrawalRequest(userName: string, amount: string) {
    return this.sendEmail({
      to: this.adminEmail,
      name: 'System Admin',
      subject: 'New Withdrawal Requested 💰',
      htmlContent: templates.getAdminWithdrawalRequestTemplate(userName, amount),
    });
  }

  public static async notifyAdminNewRequest(userName: string, type: string) {
    return this.sendEmail({
      to: this.adminEmail,
      name: 'System Admin',
      subject: 'New User Request Submitted 🔔',
      htmlContent: `<p>User <strong>${userName}</strong> has submitted a new request: <strong>${type}</strong></p>`,
    });
  }
}
