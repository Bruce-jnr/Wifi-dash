import axios from 'axios';

const ARKESEL_APIKEY = process.env.ARKSEL_APIKEY;
const SENDER_ID = process.env.ARKSEL_SENDER_ID;

export const sendVoucherSms = async (phone: string, code: string, packageName: string) => {
  try {
    const message = `Your Wi-Fi Dash ${packageName} voucher code is: ${code}`;
    const response = await axios.get('https://sms.arkesel.com/sms/api', {
      params: {
        action: 'send-sms',
        api_key: ARKESEL_APIKEY,
        to: phone,
        from: SENDER_ID,
        sms: message
      }
    });

    console.log(`[SMS] Arkesel response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[SMS] Arkesel failed to send to ${phone}`, error);
    throw error;
  }
};
