import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpNc-VWC4riGX9jR8TPKI6pp6-X3sd3RA",
    authDomain: "sia101-activity2-ultiren.firebaseapp.com",
    projectId: "sia101-activity2-ultiren",
    storageBucket: "sia101-activity2-ultiren.appspot.com",
    messagingSenderId: "328042643984",
    appId: "1:328042643984:web:ced785aca49f4f78188095"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
const results = L.layerGroup().addTo(map);

// Notification variables
let notificationCount = 0;
let notificationBadgeCount = 0; // New variable for the badge count
const box = document.getElementById('box');
const notificationBadge = document.getElementById('notificationBadge');
let notificationBoxVisible = false;
let userBoxVisible = false;
const userBox = document.querySelector('.user-box'); // Ensure this is globally accessible
const loginBox = document.getElementById('loginBox'); // Login box
let loginBoxVisible = false;

// Listener for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is logged in:', user.uid);
        retrieveLocations();
    } else {
        console.log('User is not logged in. Redirecting to login page.');
        window.location.href = "login.html"; // Redirect to login page if not logged in
    }
});

function toggleNotifi(event) {
    if (event) {
        event.stopPropagation();
    }

    const maxBoxHeight = 300;
    const itemHeight = 50;
    const calculatedHeight = Math.min(notificationCount * itemHeight, maxBoxHeight);

    // Close other boxes if open
    if (userBoxVisible) toggleUserBox();
    if (loginBoxVisible) toggleLoginBox();

    if (notificationBoxVisible) {
        box.style.height = '0px';
        box.style.opacity = 0;
        notificationBoxVisible = false;
        setTimeout(() => box.style.display = 'none', 300);
    } else {
        box.style.display = 'block';
        box.style.height = `${calculatedHeight}px`;
        box.style.opacity = 1;
        notificationBoxVisible = true;

        notificationBadge.textContent = 0;
        retrieveLocations();
    }
}

function toggleLoginBox(event) {
    if (event) {
        event.stopPropagation();
    }

    // Close user box if it's open
    /*if (userBoxVisible) {
        console.log("hello");
        toggleUserBox();
    }*/

    // Toggle login box visibility - Always visible when user is not logged in
    if (!loginBoxVisible) {
        loginBox.style.display = 'block';
        loginBox.style.height = '300px';
        loginBox.style.opacity = 1;
        loginBoxVisible = true;
        retrieveLoginHistory();  // Call to fetch login history when the box is opened
    } 
}

function toggleUserBox(event) { 
    if (event) {
        event.stopPropagation();
    }

    // Close notification box if it's open
    if (notificationBoxVisible) toggleNotifi();

    // Close login box if it's open
    if (loginBoxVisible) {
        loginBox.style.display = 'none';
        loginBox.style.opacity = 0;
        loginBoxVisible = false;

        setTimeout(() => {
            loginBox.style.display = 'none';
        }, 300);
    }

    // Toggle user box visibility
    if (userBoxVisible) {
        userBox.style.height = '0px';
        userBox.style.opacity = 0;
        userBoxVisible = false;

        setTimeout(() => {
            userBox.style.display = 'none';
        }, 300);
    } else {
        userBox.style.display = 'block';
        userBox.style.height = 'auto';
        userBox.style.opacity = 1;
        userBoxVisible = true;
    }
}


// Event listeners for icons
document.getElementById('notificationIcon')?.addEventListener('click', toggleNotifi);
document.getElementById('userIcon')?.addEventListener('click', toggleUserBox);
document.getElementById('loginHistory')?.addEventListener('click', (event) => {
    toggleLoginBox();
});


// Function to retrieve login history
async function retrieveLoginHistory() {
    const user = auth.currentUser; // Check if the user is logged in
    if (!user) {
        console.error("User is not logged in.");
        alert('You need to log in to view your login history.');
        return;
    }

    const uid = user.uid;
    const loginList = document.getElementById('loginList');
    loginList.innerHTML = ''; // Clear any existing login history entries

    try {
        const response = await fetch(`http://localhost:3000/login-history/${uid}`); // Fixed template string
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); // Fixed template string
        }
        
        const loginData = await response.json();

        // Check if there are any login history records
        if (loginData.loginHistory.length === 0) {
            loginList.innerHTML = '<p>No login history found.</p>';
        } else {
            // Sort and display each login timestamp
            loginData.loginHistory
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .forEach((entry) => {
                    const loginItem = document.createElement('div');
                    loginItem.className = 'login-item';
                    loginItem.innerHTML = `<p>Log In Time: ${new Date(entry.time).toLocaleString()}</p>`; // Fixed template string
                    loginList.appendChild(loginItem);
                });
        }
    } catch (error) {
        console.error('Error retrieving login history:', error);
        alert('Failed to retrieve login history. Please try again later.');
    }
}

// Function to retrieve locations
async function retrieveLocations() {
    const user = auth.currentUser; // Check current user
    if (!user) {
        console.error("User is not logged in.");
        alert('You need to log in to view notifications.'); // Alert if user is not logged in
        return;
    }

    const uid = user.uid;
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = ''; // Clear previous notifications

    try {
        const response = await fetch(`http://localhost:3000/notifications/${uid}`); // Fixed template string
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); // Fixed template string
        }
        const webhookData = await response.json();

        // Update notificationCount to match the length of the fetched notifications
        notificationCount = webhookData.notifications.length;
        document.getElementById('notificationCount').textContent = notificationCount; // Update the count display

        // Clear the notification list if there are no notifications
        if (notificationCount === 0) {
            notificationList.innerHTML = '<p>No notifications found.</p>';
        } else {
            webhookData.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            webhookData.notifications.forEach((data) => {
                const notificationItem = document.createElement('div');
                notificationItem.className = 'notifi-item';
                notificationItem.innerHTML = `<div class="text"><h4>Location: ${data.action}, Time: ${new Date(data.timestamp).toLocaleString()}</h4></div>`; // Fixed template string
                notificationList.appendChild(notificationItem);
            });
        }
    } catch (error) {
        console.error('Error retrieving webhook data:', error);
        alert('Failed to retrieve notifications. Please try again later.');
    }
}

// Function to send webhook notification
function sendWebhookNotification(action) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not logged in.");
        return;
    }

    const uid = user.uid;
    const payload = {
        action: action,
        uid: uid,
        timestamp: new Date().toISOString(),
    };

    fetch('http://localhost:3000/send-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (response.ok) {
            // Only increment the badge count for new notifications
            notificationBadgeCount++; 
            notificationBadge.textContent = notificationBadgeCount;
            notificationBadgeCount = 0; // Update the badge display
            console.log('Notification sent successfully');
        } else {
            console.error('Failed to send notification:', response.status, response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to handle search
async function searchFunction() {
    const query = document.getElementById('searchInput').value;
    results.clearLayers();

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`); // Fixed template string
        const data = await response.json();

        if (data.length > 0) {
            const result = data[0];
            const latlng = [result.lat, result.lon];
            results.addLayer(L.marker(latlng).bindPopup(result.display_name).openPopup());
            map.setView(latlng, 13);
            sendWebhookNotification(result.display_name);
        } else {
            alert('Location not found.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while searching.');
    }
}

// Event listeners for search button
document.getElementById('searchButton')?.addEventListener('click', searchFunction);

let toastBox = document.getElementById('toastBox');
function showToast(msg) {
    toastBox.innerHTML = '';
    let toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = msg;
    toastBox.appendChild(toast);
    
    // Auto-remove the toast after 6 seconds
    setTimeout(() => {
        toast.remove();
    }, 6000);
}

function logout() {
    const auth = getAuth(); // Get Firebase Auth instance

    // Sign out the user
    signOut(auth).then(() => {
        console.log('User logged out successfully');

        // Redirect to index.html and prevent going back
        window.location.replace('index.html'); // Redirects and replaces the current page in history
    }).catch((error) => {
        console.error('Error logging out:', error);
        alert('An error occurred during logout. Please try again.');
    });
}

document.getElementById('logout')?.addEventListener('click', logout);

// Show a welcome toast on page load
window.onload = function() {
    showToast('<i class="fa-solid fa-circle-check"></i> Successfully logged in!');
};
