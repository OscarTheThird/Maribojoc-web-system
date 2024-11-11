const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Firebase service account setup
const serviceAccount = require('./firebase-sevice-account.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sia101-activity2-ultiren.firebaseio.com'
});

const db = admin.firestore();

// Serve static files from the "styles" directory
app.use(express.static('styles'));

// Default route to serve `index.html`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles', 'index.html'));
});

// Route to serve `map.html`
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles', 'map.html'));
});

// Endpoint to send notification data to webhook.site and store in Firestore
app.post('/send-webhook', async (req, res) => {
    const webhookUrl = 'https://webhook.site/a4927484-dc12-4ff5-be86-1adff2b3298b';
    const { action, uid, timestamp } = req.body;

    if (!action || !uid || !timestamp) {
        return res.status(400).json({ message: 'Invalid payload: Missing required fields' });
    }

    try {
        // Forward request to webhook.site
        const response = await axios.post(webhookUrl, req.body, {
            headers: { 'Content-Type': 'application/json' },
        });

        // Store notification in Firestore under the UID
        const userNotificationsRef = db.collection('notifications').doc(uid).collection('locations');
        await userNotificationsRef.add({ action, timestamp });

        res.status(200).json({ message: 'Data sent to webhook successfully', data: response.data });
    } catch (error) {
        console.error('Error sending data to webhook:', error);
        res.status(500).json({ message: 'Failed to send data to webhook', error: error.message });
    }
});

// Endpoint to retrieve notifications for a specific UID
app.get('/notifications/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        const snapshot = await db.collection('notifications').doc(uid).collection('locations').get();
        const userNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ notifications: userNotifications });
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ message: 'Failed to retrieve notifications' });
    }
});

// Endpoint to retrieve login history for a specific UID
app.get('/login-history/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        const snapshot = await db.collection('loginHistory').doc(uid).collection('history').get();
        const loginHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ loginHistory });
    } catch (error) {
        console.error('Error retrieving login history:', error);
        res.status(500).json({ message: 'Failed to retrieve login history' });
    }
});

// Endpoint to log user login activity
app.post('/login', async (req, res) => {
    const webhookUrl = 'https://webhook.site/a4927484-dc12-4ff5-be86-1adff2b3298b';
    const { email, uid } = req.body;

    if (!email || !uid) {
        return res.status(400).json({ message: 'Email and UID are required.' });
    }

    try {
        console.log(`Attempting to write login history for UID: ${uid}, Email: ${email}`);

        const docRef = await db.collection('loginHistory').doc(uid).collection('history').add({
            email,
            time: new Date().toISOString(),
        });

        console.log('Login history written with ID:', docRef.id);

        // Forward request to webhook.site
        const response = await axios.post(webhookUrl, req.body, {
            headers: { 'Content-Type': 'application/json' },
        });

        res.status(200).json({ message: 'Login notification sent successfully.' });
    } catch (error) {
        console.error('Error sending data to webhook or writing to Firestore:', error);
        res.status(500).json({ message: 'Failed to send data to webhook or save login history', error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
