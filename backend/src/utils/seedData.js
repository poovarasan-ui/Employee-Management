const mongoose = require('mongoose');
const Employee = require('../models/Employee'); // Adjust path to your Employee model if needed
require('dotenv').config();

const sampleEmployees = [
  {
    employee_id: 'EMP-101',
    name: 'Poovaran Sambath',
    email: 'poovarasansambath135@gmail.com',
    phone: '+91 98000 00000',
    department: 'Operations',
    designation: 'Product Manager',
    salary: 20.0,
    joining_date: new Date('2000-03-01')
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
    employee_id: 'EMP-106',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@enterprise.com',
    phone: '+91 98200 12345',
    department: 'Operations',
    designation: 'Product Manager',
    salary: 12.5,
    joining_date: new Date('2022-06-15')
  },
  {
    employee_id: 'EMP-107',
    name: 'Marcus Chen',
    email: 'marcus.chen@enterprise.com',
    phone: '+91 98300 54321',
    department: 'Human Resources',
    designation: 'HR Specialist',
    salary: 7.5,
    joining_date: new Date('2024-01-10')
  },
  {
    employee_id: 'EMP-108',
    name: 'Sophia Martinez',
    email: 'sophia.martinez@enterprise.com',
    phone: '+91 98400 67890',
    department: 'Testing',
    designation: 'QA Lead',
    salary: 10.2,
    joining_date: new Date('2021-11-20')
  },
  {
    employee_id: 'EMP-109',
    name: 'Liam O Connor',
    email: 'liam.oconnor@enterprise.com',
    phone: '+91 98500 11223',
    department: 'Finance',
    designation: 'Senior Accountant',
    salary: 11.0,
    joining_date: new Date('2022-09-05')
  },
  {
    employee_id: 'EMP-110',
    name: 'Rohan Verma',
    email: 'rohan.verma@enterprise.com',
    phone: '+91 98600 33445',
    department: 'Engineering',
    designation: 'Frontend Developer',
    salary: 8.5,
    joining_date: new Date('2023-07-19')
  },
  {
    employee_id: 'EMP-111',
    name: 'Neha Gupta',
    email: 'neha.gupta@enterprise.com',
    phone: '+91 98700 55667',
    department: 'Sales',
    designation: 'Account Executive',
    salary: 9.0,
    joining_date: new Date('2022-10-01')
  },
  {
    employee_id: 'EMP-112',
    name: 'Vikram Singh',
    email: 'vikram.singh@enterprise.com',
    phone: '+91 98800 77889',
    department: 'Support',
    designation: 'Support Engineer',
    salary: 6.5,
    joining_date: new Date('2024-02-14')
  },
  {
    
    employee_id: 'EMP-115',
    name: 'Maya Patel',
    email: 'maya.patel@enterprise.com',
    phone: '+91 99111 22334',
    department: 'Design',
    designation: 'UI/UX Lead',
    salary: 13.0,
    joining_date: new Date('2022-04-18')
  
  },
  {
    employee_id: 'EMP-113',
    name: 'karthi',
    email: 'karthi.iyer@enterprise.com',
    phone: '+91 98900 99991',
    department: 'Testing',
    designation: 'Automation QA',
    salary: 9.2,
    joining_date: new Date('2022-05-23')

  },
  {
    employee_id: 'EMP-113',
    name: 'Kavita Iyer',
    email: 'kavita.iyer@enterprise.com',
    phone: '+91 98900 99001',
    department: 'Testing',
    designation: 'Automation QA',
    salary: 9.2,
    joining_date: new Date('2023-05-22')
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/employee_dashboard';
    await mongoose.connect(mongoURI);
    console.log('Database connected for seeding...');

    await Employee.deleteMany({});
    console.log('Old employees cleared.');

    await Employee.insertMany(sampleEmployees);
    console.log('All 10 sample employees inserted successfully!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();