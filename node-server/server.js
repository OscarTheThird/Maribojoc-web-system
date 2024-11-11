const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Firebase service account setup
const serviceAccount = require('./firebase-sevice-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sia101-activity2-ultiren.firebaseio.com'
});
const db = admin.firestore();

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

// Endpoint to send notification data to webhook.site and store by UID
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

        // Store notifications in Firestore under the UID
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

// Endpoint to retrieve notifications for a specific UID from Firestore
app.get('/notifications/:uid', async (req, res) => {
    
    const uid = req.params.uid;

    try {
        // Retrieve notifications from Firestore
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

// Endpoint to retrieve login history for a specific UID from Firestore
app.get('/login-history/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        // Access the user's login history collection
        const historyRef = db.collection('loginHistory').doc(uid).collection('history');
        const snapshot = await historyRef.get();
        const loginHistory = [];

        snapshot.forEach(doc => {
            loginHistory.push({ id: doc.id, ...doc.data() });
        });

        // Send the login history back to the client
        res.status(200).json({ loginHistory });
    } catch (error) {
        console.error('Error retrieving login history:', error);
        res.status(500).json({ message: 'Failed to retrieve login history' });
    }
});



app.post('/login', async (req, res) => {
    const webhookUrl = 'https://webhook.site/a4927484-dc12-4ff5-be86-1adff2b3298b';
    const { email, uid } = req.body;

    if (!email || !uid) {
        return res.status(400).json({ message: 'Email and UID are required.' });
    }

    try {
        // Log the login event in Firestore
        console.log(`Attempting to write login history for UID: ${uid}, Email: ${email}`);
        
        const docRef = await db.collection('loginHistory').doc(uid).collection('history').add({
            email: email,
            time: new Date().toISOString(),
        });

        console.log('Login history written with ID:', docRef.id); // Logging success

        // Forward the request to webhook.site
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
