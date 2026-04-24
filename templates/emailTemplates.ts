/**
 * IND Distribution - Premium Email Templates
 * Responsive, dark/light friendly, modern SaaS aesthetics.
 */

const LOGO_URL = "https://picsum.photos/seed/ind-logo/200/60"; // Placeholder branding
const ACCENT_COLOR = "#0066FF";
const BG_GRADIENT = "linear-gradient(135deg, #0066FF 0%, #00D1FF 100%)";

const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; border-radius: 16px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .header { background: ${BG_GRADIENT}; padding: 40px 20px; text-align: center; }
        .header img { height: 40px; }
        .content { padding: 40px; line-height: 1.6; }
        .button { display: inline-block; padding: 14px 28px; background-color: ${ACCENT_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 20px; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 12px; color: #64748b; }
        .footer a { color: ${ACCENT_COLOR}; text-decoration: none; margin: 0 10px; }
        .feature-box { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
        h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: -0.02em; }
        h2 { color: #0f172a; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IND DISTRIBUTION</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; 2026 IND Distribution. All rights reserved.</p>
            <p>
                <a href="#">Dashboard</a> | <a href="#">Support</a> | <a href="#">Twitter</a>
            </p>
            <p>If you have any questions, reply to this email or contact us at support@inddistribution.com</p>
        </div>
    </div>
</body>
</html>
`;

export const getWelcomeTemplate = (name: string) => baseWrapper(`
    <h2>Welcome to the Era of IND, ${name}!</h2>
    <p>Your journey to global distribution officially begins now. You've joined the matrix of elite independent artists commanding the airwaves.</p>
    <div class="feature-box">
        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Complete your dynamic artist profile</li>
            <li>Upload your first Hi-Fi master recording</li>
            <li>Select your global distribution routes</li>
        </ul>
    </div>
    <a href="{{APP_URL}}/dashboard" class="button">Access Mainframe</a>
`);

export const getVerificationTemplate = (otp: string) => baseWrapper(`
    <h2>Verify Your Identity</h2>
    <p>Secure authentication protocol initiated. Please use the following code to verify your account and activate your artist dashboard.</p>
    <div class="feature-box" style="text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 0.5em; color: ${ACCENT_COLOR};">
        ${otp}
    </div>
    <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
`);

export const getUploadConfirmationTemplate = (songName: string) => baseWrapper(`
    <h2>Asset Received: ${songName}</h2>
    <p>Your master transmission was successful. Our content review board has received your data and is currently verifying your metadata matrix.</p>
    <div class="feature-box">
        <p><strong>Current Status:</strong> Pending Verification</p>
        <p><strong>Audit Time:</strong> ~24-48 Hours</p>
    </div>
    <a href="{{APP_URL}}/dashboard/releases" class="button">Track Status</a>
`);

export const getApprovalTemplate = (songName: string) => baseWrapper(`
    <h2>PROTOCOL APPROVED: ${songName}</h2>
    <p>Excellent news. Our review board has cleared your release for global injection. Your distribution routes are now being activated across 250+ stores.</p>
    <div class="feature-box" style="border-left: 4px solid #10b981;">
        <p><strong>Next Phase:</strong> Technical Ingestion</p>
        <p><strong>Action Required:</strong> None. Sit back while we command the airwaves.</p>
    </div>
    <a href="{{APP_URL}}/dashboard/releases" class="button">View Release</a>
`);

export const getRejectionTemplate = (songName: string, reason: string) => baseWrapper(`
    <h2>TRANSMISSION INTERRUPTED: ${songName}</h2>
    <p>Our audit has identified structural anomalies in your submission that prevent global distribution. Please review the feedback below and recalibrate your assets.</p>
    <div class="feature-box" style="border-left: 4px solid #ef4444; background-color: #fef2f2;">
        <p><strong>Rejection Factor:</strong></p>
        <p style="color: #991b1b;">"${reason}"</p>
    </div>
    <p>You can fix your assets and resubmit for a priority audit through your dashboard.</p>
    <a href="{{APP_URL}}/dashboard/releases" class="button">Recalibrate Assets</a>
`);

export const getInvoiceTemplate = (amount: string, transactionId: string) => baseWrapper(`
    <h2>Transaction Successful</h2>
    <p>Thank you for choosing IND Distribution. We have received your payment for the distribution protocol. Your assets are now prioritized for delivery.</p>
    <div class="feature-box">
        <p><strong>Amount Paid:</strong> ${amount}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <a href="{{APP_URL}}/dashboard/billing" class="button">Download Full Invoice</a>
`);

export const getLiveSuccessTemplate = (songName: string) => baseWrapper(`
    <h2>TARGET ACQUIRED: ${songName} IS LIVE!</h2>
    <p>Mission accomplished. Your release has successfully reached the global airwaves. Your digital footprint is now active across Spotify, Apple Music, and all major gateways.</p>
    <div class="feature-box" style="background-color: #ecfdf5; border: 1px solid #10b981;">
        <p><strong>Status:</strong> GLOBAL LIVE</p>
        <p><strong>Impact:</strong> 250+ Platforms Active</p>
    </div>
    <p>Access your dossier for direct platform links to share with your fanbase.</p>
    <a href="{{APP_URL}}/dashboard/releases" class="button">Collect Dossier</a>
`);

export const getCorrectionRequiredTemplate = (songName: string, notes: string) => baseWrapper(`
    <h2>ACTION REQUIRED: ${songName}</h2>
    <p>Your release requires minor technical adjustments before it can be cleared for global distribution. Our team has provided specific guidance to help you fix these issues.</p>
    <div class="feature-box" style="border-left: 4px solid #f59e0b; background-color: #fffbeb;">
        <p><strong>Required Adjustments:</strong></p>
        <p style="color: #92400e;">"${notes}"</p>
    </div>
    <a href="{{APP_URL}}/dashboard/releases" class="button">Perform Maintenance</a>
`);

export const getRoyaltyAddedTemplate = (amount: string, period: string) => baseWrapper(`
    <h2>EARNINGS ACQUIRED: ${amount}</h2>
    <p>New financial assets have been injected into your wallet matrix from your global distribution streams for the period of <strong>${period}</strong>.</p>
    <div class="feature-box">
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Period:</strong> ${period}</p>
    </div>
    <a href="{{APP_URL}}/dashboard/wallet" class="button">View Balance</a>
`);

export const getWithdrawalApprovedTemplate = (amount: string) => baseWrapper(`
    <h2>WITHDRAWAL CLEARED: ${amount}</h2>
    <p>Your request to liquidate your earnings has been cleared by our finance department. The funds are currently being prepared for transmission to your registered account.</p>
    <div class="feature-box" style="border-left: 4px solid #10b981;">
        <p><strong>Status:</strong> Approved / Processing</p>
    </div>
    <p>You will receive another notification once the transmission is completed.</p>
`);

export const getWithdrawalCompletedTemplate = (amount: string, txId: string) => baseWrapper(`
    <h2>FUNDS TRANSMITTED: ${amount}</h2>
    <p>The financial transmission is complete. Your earnings have been successfully sent to your destination account.</p>
    <div class="feature-box" style="background-color: #ecfdf5; border: 1px solid #10b981;">
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Reference:</strong> ${txId}</p>
    </div>
    <p>Please check your bank/wallet for the arrival of assets.</p>
`);

export const getRequestSubmittedTemplate = (type: string) => baseWrapper(`
    <h2>REQUEST REGISTERED</h2>
    <p>Your inquiry regarding <strong>${type}</strong> has been successfully registered in our task matrix. Our operational team is currently evaluating the parameters.</p>
    <div class="feature-box">
        <p><strong>Protocol Type:</strong> ${type}</p>
        <p><strong>ETA:</strong> ~24-72 Hours</p>
    </div>
`);

export const getRequestUpdateTemplate = (type: string, status: 'Approved' | 'Rejected' | 'Completed', details?: string) => baseWrapper(`
    <h2>REQUEST STATUS: ${status.toUpperCase()}</h2>
    <p>The status of your <strong>${type}</strong> request has been updated to <strong>${status}</strong>.</p>
    ${details ? `<div class="feature-box"><p>${details}</p></div>` : ''}
    <a href="{{APP_URL}}/dashboard/requests" class="button">View Dashboard</a>
`);

// Admin Templates
export const getAdminNewUploadTemplate = (userName: string, songName: string) => baseWrapper(`
    <h2>NEW ASSET INGESTION</h2>
    <p><strong>${userName}</strong> has uploaded a new release for review.</p>
    <div class="feature-box">
        <p><strong>Artist/User:</strong> ${userName}</p>
        <p><strong>Song Title:</strong> ${songName}</p>
    </div>
    <a href="{{APP_URL}}/admin/releases" class="button">Initiate Review</a>
`);

export const getAdminWithdrawalRequestTemplate = (userName: string, amount: string) => baseWrapper(`
    <h2>WITHDRAWAL PROTOCOL INITIATED</h2>
    <p><strong>${userName}</strong> is requesting a liquidation of funds.</p>
    <div class="feature-box">
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Amount:</strong> ${amount}</p>
    </div>
    <a href="{{APP_URL}}/admin/finance" class="button">Financial Dashboard</a>
`);
