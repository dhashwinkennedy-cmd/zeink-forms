
/**
 * Zienk OTP Verification Service (Twilio Integration)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Twilio Console -> Account Info -> Copy 'Account SID' and 'Auth Token'.
 * 2. Search for 'Verify' -> Services -> 'Create Service' -> Copy 'Service SID' (VA...).
 * 3. Provide these to me or paste them below.
 * 
 * SECURITY NOTE: 
 * Direct browser calls to Twilio are blocked by CORS. This is a security feature 
 * to prevent your Auth Token from being exposed.
 */

export const TWILIO_CONFIG = {
  accountSid: '',       // PASTE Account SID
  authToken: '',        // PASTE Auth Token
  serviceSid: '',       // PASTE Service SID (VA...)
  useSimulation: true   // Set to FALSE when keys are provided
};

export const sendOTP = async (to: string, channel: 'sms' | 'email'): Promise<boolean> => {
  if (TWILIO_CONFIG.useSimulation || !TWILIO_CONFIG.accountSid) {
    console.log(`[Zienk OTP] SIMULATION: Sending ${channel} to ${to}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1500));
  }

  try {
    const auth = btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`);
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_CONFIG.serviceSid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ 'To': to, 'Channel': channel })
      }
    );
    return response.ok;
  } catch (e) {
    console.error("OTP Send Error:", e);
    return false;
  }
};

export const verifyOTP = async (to: string, code: string): Promise<boolean> => {
  if (TWILIO_CONFIG.useSimulation || !TWILIO_CONFIG.accountSid) {
    console.log(`[Zienk OTP] SIMULATION: Verifying ${code} for ${to}`);
    // Code '123456' is the secret key in simulation mode
    return new Promise(resolve => setTimeout(() => resolve(code === '123456'), 1500));
  }

  try {
    const auth = btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`);
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_CONFIG.serviceSid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ 'To': to, 'Code': code })
      }
    );
    const data = await response.json();
    return data.status === 'approved';
  } catch (e) {
    console.error("OTP Verify Error:", e);
    return false;
  }
};
