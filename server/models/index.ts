import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  otp_code: { type: DataTypes.STRING, allowNull: true },
  otp_expires: { type: DataTypes.DATE, allowNull: true }
});

export const Package = sequelize.define('Package', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  data_limit: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
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
  request_id: { type: DataTypes.INTEGER, allowNull: false },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'used'), defaultValue: 'active' }
});

// Relationships
Package.hasMany(VoucherRequest, { foreignKey: 'package_id' });
VoucherRequest.belongsTo(Package, { foreignKey: 'package_id' });

VoucherRequest.hasOne(Voucher, { foreignKey: 'request_id' });
Voucher.belongsTo(VoucherRequest, { foreignKey: 'request_id' });

Package.hasMany(Voucher, { foreignKey: 'package_id' });
Voucher.belongsTo(Package, { foreignKey: 'package_id' });

export const initDb = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully!');
  } catch (err) {
    console.error('Failed to sync database models:', err);
  }
};
