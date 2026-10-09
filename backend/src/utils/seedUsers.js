const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/employee-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for user seeding...');

    const salt = await bcrypt.genSalt(10);

    // 1. Admin Account
    const adminEmail = 'admin@enterprise.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin@1234', salt);
      admin = await User.create({
        username: 'AdminUser',
        email: adminEmail,
        phone: '+91 99999 88888',
        password: hashedPassword,
        role: 'admin',
        employee_id: ''
      });
      console.log('Created Admin account:', adminEmail);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log('Updated existing Admin role for:', adminEmail);
    }

    // 2. Employee Account
    const empEmail = 'employee@enterprise.com';
    let emp = await User.findOne({ email: empEmail });
    if (!emp) {
      const hashedPassword = await bcrypt.hash('Employee@1234', salt);
      emp = await User.create({
        username: 'AlexRivera',
        email: empEmail,
        phone: '+91 98888 77777',
        password: hashedPassword,
        role: 'employee',
        employee_id: 'EMP-102'
      });
      console.log('Created Employee account:', empEmail);
    } else {
      emp.role = 'employee';
      emp.employee_id = emp.employee_id || 'EMP-102';
      await emp.save();
      console.log('Updated existing Employee role for:', empEmail);
    }

    // Also ensure any existing users without a role have 'admin'
    await User.updateMany({ role: { $exists: false } }, { $set: { role: 'admin' } });

    console.log('User roles successfully updated and ready for testing!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
