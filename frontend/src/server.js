const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to NoticeNest API!',
        status: 'Server is running successfully'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'NoticeNest backend is healthy!'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`NoticeNest server running on port ${PORT}`);
});