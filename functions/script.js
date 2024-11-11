import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
    const db = getFirestore(app); // Initialize Firestore

    document.getElementById('btn_register').addEventListener('click', async () => {
        let email = document.getElementById("registerEmail").value;
        let password = document.getElementById("registerPassword").value;
        let confirmpass = document.getElementById('confirmPassword').value;
    
        // Check if all inputs are filled
        if (email === '' || password === '' || confirmpass === '') {
            showToast(errorinput); 
            return; 
        }
        
        // Check if passwords match
        if (password !== confirmpass) {
            showToast('<i class="fa-solid fa-circle-xmark"></i> Password doesn\'t match. Please try again.');
            return;
        }
    
        try {
            // Create the user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Send email verification after user registration
            await sendEmailVerification(user);
            showToast(emailsend);
            
            // Redirect to login form
            //login(); // Call the login function to switch to the login form
        } catch (error) {
            let errorMessage;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Email already in use.';
                showToast(errorMessage);
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Invalid email address.';
                showToast(errorMessage);
            } else {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Error during registration. Please try again.';
                showToast(errorMessage);
            }
            console.error('Error during registration:', error.message);

        }
    });
    

    // Toast Function
    // Toast Function
    let toastBox = document.getElementById('toastBox');
    let successMsg = '<i class="fa-solid fa-circle-check"></i> Account successfully registered in!';
    let emailsend = '<i class="fa-solid fa-circle-check"></i> Email verification link sent!';
    let errornotif = '<i class="fa-solid fa-circle-xmark"></i> Invalid email or password. Please try again.';
    let errorinput = '<i class="fa-solid fa-circle-xmark"></i> Fill out all the input. Thank you.';  // Corrected typo from "put" to "out"

    function showToast(msg) {
        toastBox.innerHTML = '';
        let toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = msg;
        toastBox.appendChild(toast);
        
        // Check for the error or success message using keywords
        if (msg.includes('Invalid email or password')) {
            toast.classList.add('error');
        } 
        if (msg.includes('Account successfully registered in')) {
            toast.classList.add('success');
        }
        if (msg.includes('Fill out all')) {  
            toast.classList.add('invalid');
        }
        if (msg.includes('Email verification link')) {
            toast.classList.add('emailsent');
        }
        
        // Auto-remove the toast after 6 seconds
        setTimeout(() => {
            toast.remove();
        }, 6000);
    };



    // Firebase Authentication - Login Process
    let login = document.getElementById("log_in");

    /*login.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent form submission if it's part of a form
        let email = document.getElementById("loginEmail").value;
        let password = document.getElementById("loginPassword").value;
        
        // Check if email and password are empty
        if (email === '' || password === '') {
            showToast('<i class="fa-solid fa-circle-xmark"></i> Please enter your email and password.'); // Show the error toast if inputs are empty
            return; // Stop the function from executing further
        }
        
        try {
            console.log('Attempting to log in with:', email); // Debugging log
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;
    
            // Check if the user's email is verified
            await user.reload(); // Refresh user data to get updated email verification status
            if (!user.emailVerified) {
                showToast('<i class="fa-solid fa-circle-xmark"></i>Your account is not verified. Please check your email. Thank you!');
                return; // Stop further execution
            }
            loginwebhook();
            // Redirect to the map page if email is verified
            window.location.href = "map.html";
        } catch (error) {
            console.error('Caught an error during sign in:', error); // Log the entire error object
            let errorMessage;
    
            // Use the error code to set the error message
            if (error.code === 'auth/user-not-found') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Email not found. Please register.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Invalid email address.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Too many login attempts. Please try again later.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> This sign-in method is not allowed.';
            } else {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Error during login. Please try again.';
            }
    
            showToast(errorMessage); // Show the error message
        }
    });*/

    login.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent form submission if it's part of a form
        let email = document.getElementById("loginEmail").value;
        let password = document.getElementById("loginPassword").value;
    
        // Check if email and password are empty
        if (email === '' || password === '') {
            showToast('<i class="fa-solid fa-circle-xmark"></i> Please enter your email and password.'); 
            return; 
        }
    
        try {
            console.log('Attempting to log in with:', email); // Debugging log
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;
    
            // Check if the user's email is verified
            await user.reload(); // Refresh user data to get updated email verification status
            if (!user.emailVerified) {
                showToast('<i class="fa-solid fa-circle-xmark"></i>Your account is not verified. Please check your email. Thank you!');
                return; 
            }
    
            // Call the login webhook with email and uid
            await loginwebhook(email, user.uid);  // Pass email and uid to the webhook function
    
            // Redirect to the map page if email is verified
            window.location.replace('map.html');
        } catch (error) {
            // ... (existing error handling logic)
            console.error('Caught an error during sign in:', error); // Log the entire error object
            let errorMessage;
    
            // Use the error code to set the error message
            if (error.code === 'auth/user-not-found') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Email not found. Please register.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Invalid email address.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Too many login attempts. Please try again later.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> This sign-in method is not allowed.';
            } else {
                errorMessage = '<i class="fa-solid fa-circle-xmark"></i> Error during login. Please try again.';
            }
    
            showToast(errorMessage);
        }
    });

    async function loginwebhook(email, uid) {
        const payload = {
            email: email,
            uid: uid,
            timestamp: new Date().toISOString(),
        };
    
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
    
            if (response.ok) {
                console.log('Notification sent successfully');
            } else {
                console.error('Failed to send notification:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }