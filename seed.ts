import bcrypt from 'bcryptjs';
import { Package, Admin, initDb } from './server/models/index.js';

const seed = async () => {
  await initDb();
  
  const pkgCount = await Package.count();
  if (pkgCount === 0) {
    console.log('Seeding packages...');
    await Package.bulkCreate([
      { id: 1, name: 'Daily Pass', data_limit: '1GB', duration: '24 hours', price: 5.00 },
      { id: 2, name: 'Weekly Pass', data_limit: '5GB', duration: '7 days', price: 20.00 },
      { id: 3, name: 'Monthly Unlimited', data_limit: 'Unlimited', duration: '30 days', price: 100.00 }
    ]);
    console.log('Packages seeded successfully!');
  } else {
    console.log('Packages already seeded.');
  }

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
