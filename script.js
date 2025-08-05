// Import necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- Firebase Configuration ---
//
// IMPORTANT: Replace the placeholder values below with your own Firebase project's configuration!
// You can find this in your Firebase Console:
// Go to Project Settings (gear icon) > General tab > Scroll down to "Your apps"
// Click on the web app you created, and select "Config" to see these details.
//
const firebaseConfig = {
    apiKey: "AIzaSyCp2uabmh3eg2Fjs0RBlrZBtn8XN0jAwlE",
    authDomain: "jora-d25ef.firebaseapp.com",
    projectId: "jora-d25ef",
    storageBucket: "jora-d25ef.firebasestorage.app",
    messagingSenderId: "1028125725395",
    appId: "1:1028125725395:web:8df1a67fc4a376b1197a26"
  };

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Element References ---
const loggedInView = document.getElementById('logged-in-view');
const formView = document.getElementById('form-view');
const userEmailElement = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email-address');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit-button');
const messageArea = document.getElementById('message-area');

// --- UI Update Functions ---

/**
 * Displays a message in the message area.
 * @param {string} text - The message to display.
 * @param {boolean} isError - True if the message is an error, false for success.
 */
function showMessage(text, isError = false) {
    messageArea.textContent = text;
    messageArea.className = isError 
        ? 'text-red-500 text-sm font-medium' 
        : 'text-green-500 text-sm font-medium';
}

/**
 * Updates the entire UI based on the user's authentication state.
 * @param {object|null} user - The Firebase user object, or null if logged out.
 */
function updateUI(user) {
    if (user && !user.isAnonymous) {
        // User is signed in
        loggedInView.style.display = 'block';
        formView.style.display = 'none';
        userEmailElement.textContent = user.email;
    } else {
        // User is signed out
        loggedInView.style.display = 'none';
        formView.style.display = 'block';
    }
}

// --- Authentication Logic ---

/**
 * Handles the form submission for logging in.
 * @param {Event} e - The form submission event.
 */
async function handleAuthSubmit(e) {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    showMessage('');

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage('Login successful!', false);
        authForm.reset();
    } catch (error) {
        console.error("Authentication Error:", error);
        let friendlyMessage = "An error occurred. Please try again.";
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-email':
                    friendlyMessage = "Please enter a valid email address.";
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                     friendlyMessage = "Invalid email or password.";
                     break;
                default:
                    friendlyMessage = "An unknown error occurred. Please check the console.";
            }
        }
        showMessage(friendlyMessage, true);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
    }
}

/**
 * Signs the current user out.
 */
async function handleLogout() {
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Logout Error:", error);
        showMessage("Failed to log out. Please try again.", true);
    }
}

// --- Event Listeners ---
authForm.addEventListener('submit', handleAuthSubmit);
logoutButton.addEventListener('click', handleLogout);

// --- Main Execution ---
// Listen for authentication state changes to manage the user's session.
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});
