import bcrypt from 'bcryptjs';
import { Package, Admin, initDb } from './server/models/index.js';

const seed = async () => {
  await initDb();
  
  // Upsert packages (update if exists, create if not)
  console.log('Upserting packages...');
  const packages = [
    { id: 1, name: '2-Hour Pass',  data_limit: 'Unlimited', duration: '2 hours',  price: 2.00,  active: true },
    { id: 2, name: '10-Hour Pass', data_limit: 'Unlimited', duration: '10 hours', price: 5.00,  active: true },
    { id: 3, name: '40-Hour Pass', data_limit: 'Unlimited', duration: '40 hours', price: 10.00, active: true }
  ];
  for (const pkg of packages) {
    const [record, created] = await (Package as any).findOrCreate({ where: { id: pkg.id }, defaults: pkg });
    if (!created) await record.update(pkg);
  }
  console.log('Packages seeded successfully!');

  const adminCount = await Admin.count();
  if (adminCount === 0) {
    console.log('Seeding default Admin...');
    const hp = await bcrypt.hash('admin123', 10);
    await (Admin as any).create({
      username: 'admin',
      password: hp,
      phone: process.env.ADMIN_PHONE || '0550000000'
    });
    console.log('Admin seeded! Default pass: admin123');
  }

  process.exit();
};

seed();
