const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (CSS, JS, and images)
app.use('/styles', express.static(path.join(__dirname, '../styles')));
app.use('/functions', express.static(path.join(__dirname, '../functions')));
app.use('/image', express.static(path.join(__dirname, '../image')));
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from root

// Serve specific HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/map.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../map.html'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../home.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../about.html'));
});

// Endpoint to send notification data to webhook.site
app.post('/send-webhook', async (req, res) => {
    const webhookUrl = 'https://webhook.site/a4927484-dc12-4ff5-be86-1adff2b3298b';
    const { action, uid, timestamp } = req.body;

    // Validate payload
    if (!action || !uid || !timestamp) {
        return res.status(400).json({ message: 'Invalid payload: Missing required fields' });
    }

    try {
        // Forward the request to webhook.site
        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json({
            message: 'Data sent to webhook successfully',
            data: response.data,
        });
    } catch (error) {
        console.error('Error sending data to webhook:', error);
        res.status(500).json({
            message: 'Failed to send data to webhook',
            error: error.message,
        });
    }
});

// Endpoint to retrieve login history and notifications (directly from webhook.site)
// Note: You'll need a webhook.site link that returns stored entries in a format your front end can process.
// Here, we'll use '/retrieve-webhook' as an example route.
app.get('/retrieve-webhook', async (req, res) => {
    const webhookRetrieveUrl = 'https://webhook.site/a4927484-dc12-4ff5-be86-1adff2b3298b'; // Example URL

    // Attempt to retrieve data from Webhook.site (this might not work depending on their API)
    try {
        const response = await axios.get(webhookRetrieveUrl, {
            headers: { 'Content-Type': 'application/json' },
        });

        // Log response data
        console.log('Data retrieved from Webhook.site:', response.data);

        res.status(200).json({ data: response.data });
    } catch (error) {
        console.error('Error retrieving data from webhook.site:', error);
        res.status(500).json({
            message: 'Failed to retrieve data from webhook.site',
            error: error.message,
        });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
