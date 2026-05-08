import Mailjet from 'node-mailjet';

const apiKey = process.env.MAILJET_API_KEY;
const apiSecret = process.env.MAILJET_SECRET_KEY;

let mailjet: any = null;

if (apiKey && apiSecret) {
  mailjet = new Mailjet({
    apiKey,
    apiSecret
  });
} else {
  console.warn('⚠️ [Mailjet] API keys are missing. Email service will run in simulation mode.');
}

export default mailjet;
