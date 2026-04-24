import { BrevoClient } from '@getbrevo/brevo';

/**
 * Brevo Global Client Configuration
 * This unified client is the entry point for all Brevo V5 SDK operations.
 */

// We initialize with a dummy key or process.env if available.
// The service layer will ensure a valid key is present.
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || 'simulation_mode'
});

export default brevo;
