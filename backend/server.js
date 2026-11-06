require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Notice = require('./models/Notice');

const app = express();

app.use(cors());
app.use(express.json());

// Helper function to check if notice date has passed
const isDateExpired = (dateValue) => {
    if (!dateValue) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const noticeDate = new Date(dateValue);
    const noticeDay = new Date(noticeDate.getFullYear(), noticeDate.getMonth(), noticeDate.getDate());
    return noticeDay < today;
};

// 1. Home route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to NoticeNest API!',
        status: 'Server is running successfully'
    });
});

// 2. Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'NoticeNest backend is healthy!'
    });
});

// 3. Get dashboard statistics
app.get('/api/notices/stats', async (req, res) => {
    try {
        const notices = await Notice.find();
        const total = notices.length;
        const verified = notices.filter(n => n.verified).length;
        const urgent = notices.filter(n => n.urgent).length;
        const archived = notices.filter(n => isDateExpired(n.date)).length;

        res.status(200).json({
            success: true,
            stats: {
                total,
                verified,
                urgent,
                archived
            }
        });
    } catch (error) {
        console.error('Stats error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notice statistics.'
        });
    }
});

// 4. Get all notices
app.get('/api/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            notices
        });
    } catch (error) {
        console.error('Fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notices.'
        });
    }
});

// 5. Get single notice by ID
app.get('/api/notices/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notice ID format.'
            });
        }

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found.'
            });
        }

        res.status(200).json({
            success: true,
            notice
        });
    } catch (error) {
        console.error('Fetch notice by ID error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notice.'
        });
    }
});

// 6. Add a new notice (newly submitted notices remain unverified by default)
app.post('/api/notices', async (req, res) => {
    try {
        const { title, category, date, publisher, urgent } = req.body;

        if (
            !title?.trim() ||
            !category ||
            !date ||
            !publisher?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        const newNotice = new Notice({
            title: title.trim(),
            category,
            date,
            publisher: publisher.trim(),
            urgent: urgent === true,
            verified: false // Unverified by default
        });

        await newNotice.save();

        return res.status(201).json({
            success: true,
            message: 'Notice added successfully! It is pending verification.',
            notice: newNotice
        });

    } catch (error) {
        console.error('Add notice error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to add notice.',
            error: error.message
        });
    }
});

// 7. Toggle or update notice verification (PATCH /api/notices/:id/verify)
app.patch('/api/notices/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;

        // Requirement 6: Handle invalid IDs properly
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notice ID format.'
            });
        }

        // Requirement 2: Find the notice using its MongoDB ObjectId
        const notice = await Notice.findById(id);

        // Requirement 6: Handle missing notices properly
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found.'
            });
        }

        // Requirement 3: Toggle its verified field between true and false
        if (req.body && typeof req.body.verified === 'boolean') {
            notice.verified = req.body.verified;
        } else {
            notice.verified = !notice.verified;
        }

        // Requirement 4: Save the updated notice to MongoDB
        await notice.save();

        // Requirement 5: Return the updated notice as JSON
        return res.status(200).json({
            success: true,
            message: `Notice marked as ${notice.verified ? 'verified' : 'unverified'}.`,
            notice
        });

    } catch (error) {
        console.error('Verify toggle error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update verification status.',
            error: error.message
        });
    }
});

// 8. Delete a notice
app.delete('/api/notices/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notice ID format.'
            });
        }

        const deleted = await Notice.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notice deleted successfully.'
        });
    } catch (error) {
        console.error('Delete error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notice.'
        });
    }
});

// 9. Catch-all for unknown API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found.'
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing from backend/.env');
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully!');

        app.listen(PORT, () => {
            console.log(`NoticeNest server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Backend startup failed:', error.message);
        process.exit(1);
    }
}

startServer();
