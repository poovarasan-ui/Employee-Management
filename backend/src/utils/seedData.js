require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const sampleEmployees = [
  {
    employee_id: 'EMP-101',
    name: 'Sarah Connor',
    email: 'sarah.connor@enterprise.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    designation: 'Senior Developer',
    salary: 14.5,
    joining_date: new Date('2023-01-15')
  },
  {
    employee_id: 'EMP-102',
    name: 'Michael Scott',
    email: 'michael.scott@enterprise.com',
    phone: '+91 98450 12345',
    department: 'Sales',
    designation: 'Regional Manager',
    salary: 12,
    joining_date: new Date('2022-06-01')
  },
  {
    employee_id: 'EMP-103',
    name: 'Alex Rivera',
    email: 'alex.rivera@enterprise.com',
    phone: '+91 97890 67890',
    department: 'Engineering',
    designation: 'Frontend Developer',
    salary: 8.5,
    joining_date: new Date('2023-08-20')
  },
  {
    employee_id: 'EMP-104',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise.com',
    phone: '+91 99620 54321',
    department: 'Human Resources',
    designation: 'HR Manager',
    salary: 11,
    joining_date: new Date('2022-11-10')
  },
  {
    employee_id: 'EMP-105',
    name: 'David Kim',
    email: 'david.kim@enterprise.com',
    phone: '+91 98100 98765',
    department: 'Engineering',
    designation: 'Backend Developer',
    salary: 9.8,
    joining_date: new Date('2023-03-12')
  },
  {
    employee_id: "EMP-110",
    name: 'Velan',
    email: "velan@gmail.com",
    phone:'+91 8055667788',
    department: 'Mechanical',
    designation:'Mechanic',
    salary: 10,
    joining_date: new Date("2024-04-11")
  },
  {
    employee_id: 'EMP-106',
    name: 'Jessica Vance',
    email: 'jessica.vance@enterprise.com',
    phone: '+91 98200 11223',
    department: 'Marketing',
    designation: 'Marketing Manager',
    salary: 9.2,
    joining_date: new Date('2023-05-04')
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_dashboard';
    await mongoose.connect(mongoUri);
    console.log('🍃 MongoDB Connected for Seeding...');

    // Clear existing sample employees
    await Employee.deleteMany({});
    console.log('🗑️ Existing employees cleared.');

    // Insert sample employees with INR salaries
    await Employee.insertMany(sampleEmployees);
    console.log(`✅ Successfully seeded ${sampleEmployees.length} sample employees with Indian Rupees (₹ INR)!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();
