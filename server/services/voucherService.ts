import { Voucher, VoucherRequest, AuditLog, Package } from '../models/index.js';
import { sendVoucherSms } from './sms.js';

export const issueVoucher = async (requestId: number) => {
  const vr: any = await VoucherRequest.findByPk(requestId, { include: [Package] });
  if (!vr) throw new Error('Request not found');
  if (vr.status !== 'pending') throw new Error('Request already fulfilled');

  vr.payment_status = 'paid';
  await vr.save();

  // Auto-pick oldest available voucher for the right package
  const voucher: any = await Voucher.findOne({
    where: { package_id: vr.package_id, status: 'available' },
    order: [['createdAt', 'ASC']]
  });

  if (!voucher) {
    throw new Error(`No available vouchers in pool for package "${vr.Package?.name}".`);
  }

  voucher.status = 'issued';
  voucher.request_id = vr.id;
  await voucher.save();

  vr.status = 'fulfilled';
  await vr.save();

  try {
    await sendVoucherSms(vr.client_phone, voucher.code, vr.Package.name);
  } catch (smsError) {
    console.error('SMS failed but voucher is issued.', smsError);
  }

  return { voucher, vr };
};
