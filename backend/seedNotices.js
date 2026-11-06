
require('dotenv').config();

const mongoose = require('mongoose');
const Notice = require('./models/Notice');

const sampleNotices = [
    {
        title: 'Mid Semester Examination Schedule',
        category: 'Examination',
        date: new Date('2026-11-12'),
        publisher: 'Examination Cell',
        urgent: true,
        verified: true
    },
    {
        title: 'Annual College Tech Fest',
        category: 'Events',
        date: new Date('2026-11-15'),
        publisher: 'Student Council',
        urgent: false,
        verified: true
    },
    {
        title: 'Placement Training Registration',
        category: 'Placement',
        date: new Date('2026-11-18'),
        publisher: 'Placement Cell',
        urgent: true,
        verified: true
    },
    {
        title: 'Library Holiday Announcement',
        category: 'General',
        date: new Date('2026-11-20'),
        publisher: 'Library Department',
        urgent: false,
        verified: true
    }
];

async function seedNotices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Notice.deleteMany({});
        await Notice.insertMany(sampleNotices);

        console.log('Four sample notices added successfully!');
    } catch (error) {
        console.error('Error adding notices:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedNotices();
