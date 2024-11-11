const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Initialize Firebase Admin with your service account credentials
const serviceAccount = require('./firebase-sevice-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sia101-activity2-ultiren.firebaseio.com' // Update this to your database URL
});

const db = admin.firestore();

// Define your endpoints
app.post('/send-webhook', async (req, res) => {
    const webhookUrl = 'https://webhook.site/a4927484-dc12-4ff5-be86-1adff2b3298b';
    const { action, uid, timestamp } = req.body;

    if (!action || !uid || !timestamp) {
        return res.status(400).json({ message: 'Invalid payload: Missing required fields' });
    }

    try {
        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const userNotificationsRef = db.collection('notifications').doc(uid).collection('locations');
        await userNotificationsRef.add({ action, timestamp });

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

app.get('/notifications/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        const snapshot = await db.collection('notifications').doc(uid).collection('locations').get();
        const userNotifications = [];

        snapshot.forEach(doc => {
            userNotifications.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ notifications: userNotifications });
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ message: 'Failed to retrieve notifications' });
    }
});

app.get('/login-history/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        const historyRef = db.collection('loginHistory').doc(uid).collection('history');
        const snapshot = await historyRef.get();
        const loginHistory = [];

        snapshot.forEach(doc => {
            loginHistory.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ loginHistory });
    } catch (error) {
        console.error('Error retrieving login history:', error);
        res.status(500).json({ message: 'Failed to retrieve login history' });
    }
});

app.post('/login', async (req, res) => {
    const webhookUrl = 'https://webhook.site/8b58840e-795c-4638-99e5-6f92935b47e9';
    const { email, uid } = req.body;

    if (!email || !uid) {
        return res.status(400).json({ message: 'Email and UID are required.' });
    }

    try {
        const docRef = await db.collection('loginHistory').doc(uid).collection('history').add({
            email: email,
            time: new Date().toISOString(),
        });

        const response = await axios.post(webhookUrl, req.body, {
            headers: { 'Content-Type': 'application/json' },
        });

        res.status(200).json({ message: 'Login notification sent successfully.' });
    } catch (error) {
        console.error('Error sending data to webhook or writing to Firestore:', error);
        res.status(500).json({
            message: 'Failed to send data to webhook or save login history',
            error: error.message,
        });
    }
});

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
