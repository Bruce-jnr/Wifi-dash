import { Voucher, VoucherRequest, AuditLog, Package } from '../models/index.js';
import { sendVoucherSms } from './sms.js';
import sequelize from '../config/database.js';

export const issueVoucher = async (requestId: number) => {
  const { voucher, vr, alreadyFulfilled } = await sequelize.transaction(async transaction => {
    const vr: any = await VoucherRequest.findByPk(requestId, {
      include: [Package], transaction, lock: transaction.LOCK.UPDATE
    });
    if (!vr) throw new Error('Request not found');

    if (vr.status === 'fulfilled') {
      const existing: any = await Voucher.findOne({ where: { request_id: vr.id }, transaction });
      if (!existing) throw new Error('Fulfilled request has no assigned voucher');
      return { voucher: existing, vr, alreadyFulfilled: true };
    }

    vr.payment_status = 'paid';
    await vr.save({ transaction });

    const voucher: any = await Voucher.findOne({
      where: { package_id: vr.package_id, status: 'available' },
      order: [['createdAt', 'ASC']], transaction, lock: transaction.LOCK.UPDATE
    });
    if (!voucher) throw new Error(`No available vouchers in pool for package "${vr.Package?.name}".`);

    voucher.status = 'issued';
    voucher.request_id = vr.id;
    await voucher.save({ transaction });
    vr.status = 'fulfilled';
    await vr.save({ transaction });
    return { voucher, vr, alreadyFulfilled: false };
  });

  if (!alreadyFulfilled) try {
    await sendVoucherSms(vr.client_phone, voucher.code, vr.Package.name);
  } catch (smsError) {
    console.error('SMS failed but voucher is issued.', smsError);
  }

  return { voucher, vr, alreadyFulfilled };
};
