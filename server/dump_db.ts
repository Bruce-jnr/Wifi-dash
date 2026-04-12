import { VoucherRequest, Package } from './models/index.js';

async function dump() {
  try {
    const requests = await VoucherRequest.findAll({ include: [Package] });
    console.log('--- Voucher Requests Dump ---');
    requests.forEach((r: any) => {
      console.log(`ID: ${r.id}, Phone: ${r.client_phone}, Status: ${r.status}, Payment: ${r.payment_status}, Price: ${r.Package?.price}`);
    });
    console.log('-----------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dump();
