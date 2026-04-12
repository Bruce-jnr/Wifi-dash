import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
});

export const initializeTransaction = async (email: string, amount: number, metadata: any, callback_url?: string) => {
  try {
    const response = await paystack.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Convert to pesewas/kobo
      metadata,
      callback_url,
      channels: ['card', 'mobile_money']
    });
    return response.data.data; // { authorization_url, access_code, reference }
  } catch (error: any) {
    console.error('Paystack Initialize Error:', error.response?.data || error.message);
    throw new Error('Failed to initialize Paystack transaction');
  }
};

export const verifyTransaction = async (reference: string) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    throw new Error('Failed to verify Paystack transaction');
  }
};
