import { VoucherRequest, Package } from './models/index.js';

async function testStats() {
  try {
    const totalPackages = await Package.count();
    const pendingRequests = await VoucherRequest.count({ where: { status: 'pending' } });
    const fulfilledRequests = await VoucherRequest.count({ where: { status: 'fulfilled' } });
    
    // Calculate total revenue from fulfilled requests
    const paidRequests: any[] = await VoucherRequest.findAll({
      where: { status: 'fulfilled' },
      include: [Package]
    }) as any[];
    
    const revenue = paidRequests.reduce((sum, req) => sum + Number(req.Package?.price || 0), 0);

    console.log('--- Stats Calculation Diagnostic ---');
    console.log('Total Packages:', totalPackages);
    console.log('Pending Requests:', pendingRequests);
    console.log('Fulfilled Requests:', fulfilledRequests);
    console.log('Revenue:', revenue);
    console.log('Paid Requests raw data sample:', JSON.stringify(paidRequests.slice(0, 1), null, 2));
    console.log('-----------------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testStats();
