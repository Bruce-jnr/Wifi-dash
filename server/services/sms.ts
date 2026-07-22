import axios from 'axios';

const ARKESEL_APIKEY = process.env.ARKSEL_APIKEY;
const SENDER_ID = process.env.ARKSEL_SENDER_ID;

export const normalizeGhanaPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`;
  if (digits.length === 9) return `233${digits}`;
  return digits;
};

const sendSms = async (phone: string, message: string) => {
  try {
    const response = await axios.get('https://sms.arkesel.com/sms/api', {
      params: {
        action: 'send-sms',
        api_key: ARKESEL_APIKEY,
        to: normalizeGhanaPhone(phone),
        from: SENDER_ID,
        sms: message,
      },
      timeout: 15_000,
    });

    console.log('[SMS] Provider response', {
      code: response.data?.code,
      message: response.data?.message,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('[SMS] Provider request failed', {
        code: error.code,
        status: error.response?.status,
        providerCode: error.response?.data?.code,
        providerMessage: error.response?.data?.message,
      });
    } else {
      console.error('[SMS] Unexpected provider error');
    }
    throw error;
  }
};

export const sendVoucherSms = (phone: string, code: string, packageName: string) =>
  sendSms(phone, `Your Wi-Fi Dash ${packageName} voucher code is: ${code}`);

export const sendPasswordResetOtp = (phone: string, otp: string) =>
  sendSms(phone, `Your Wi-Fi Dash password reset code is: ${otp}. It expires in 10 minutes.`);
