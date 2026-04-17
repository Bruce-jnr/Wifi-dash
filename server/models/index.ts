import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  otp_code: { type: DataTypes.STRING, allowNull: true },
  otp_expires: { type: DataTypes.DATE, allowNull: true }
});

export const Package = sequelize.define('Package', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  community: { type: DataTypes.ENUM('town', 'school'), defaultValue: 'town' },
  data_limit: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const VoucherRequest = sequelize.define('VoucherRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  client_phone: { type: DataTypes.STRING, allowNull: false },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'fulfilled'), defaultValue: 'pending' },
  payment_status: { type: DataTypes.ENUM('pending', 'paid'), defaultValue: 'pending' }
});

export const Voucher = sequelize.define('Voucher', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  request_id: { type: DataTypes.INTEGER, allowNull: true },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('available', 'issued'), defaultValue: 'available' }
});

// Relationships
Package.hasMany(VoucherRequest, { foreignKey: 'package_id' });
VoucherRequest.belongsTo(Package, { foreignKey: 'package_id' });

// Note: Voucher.request_id is a soft reference — no FK managed by Sequelize
// This avoids MySQL conflicts when request_id is nullable.
Package.hasMany(Voucher, { foreignKey: 'package_id' });
Voucher.belongsTo(Package, { foreignKey: 'package_id' });

export const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  admin_username: { type: DataTypes.STRING, allowNull: false },
  action_type: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false }
});

export const initDb = async () => {
  try {
    await sequelize.sync();
    console.log('Database models synchronized successfully!');
  } catch (err) {
    console.error('Failed to sync database models:', err);
  }
};
