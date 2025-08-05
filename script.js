// Import necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
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
// This will now work correctly once you've added your config above.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Element References ---
const loggedInView = document.getElementById('logged-in-view');
const formView = document.getElementById('form-view');
const userEmailElement = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const emailInput = document.getElementById('email-address');
const passwordInput = document.getElementById('password');
const confirmPasswordContainer = document.getElementById('confirm-password-container');
const confirmPasswordInput = document.getElementById('confirm-password');
const submitButton = document.getElementById('submit-button');
const toggleModeLink = document.getElementById('toggle-mode');
const messageArea = document.getElementById('message-area');

// --- State Management ---
let isSignUpMode = false;

// --- UI Update Functions ---

/**
 * Toggles the form between Login and Sign Up modes.
 */
function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    messageArea.textContent = ''; // Clear any previous messages
    authForm.reset(); // Clear input fields

    if (isSignUpMode) {
        formTitle.textContent = 'Sign Up';
        submitButton.textContent = 'Create Account';
        toggleModeLink.innerHTML = 'Have an account? <span class="font-bold">Login</span>';
        confirmPasswordContainer.style.display = 'block';
        confirmPasswordInput.required = true;
        passwordInput.classList.remove('rounded-b-md');
    } else {
        formTitle.textContent = 'Login';
        submitButton.textContent = 'Sign In';
        toggleModeLink.innerHTML = 'Need an account? <span class="font-bold">Sign Up</span>';
        confirmPasswordContainer.style.display = 'none';
        confirmPasswordInput.required = false;
        passwordInput.classList.add('rounded-b-md');
    }
}

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
        // User is signed in with Email/Password
        loggedInView.style.display = 'block';
        formView.style.display = 'none';
        userEmailElement.textContent = user.email;
    } else {
        // User is signed out or anonymous
        loggedInView.style.display = 'none';
        formView.style.display = 'block';
        if (isSignUpMode) {
            toggleAuthMode();
        }
    }
}

// --- Authentication Logic ---

/**
 * Handles the form submission for both login and sign-up.
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
        if (isSignUpMode) {
            const confirmPassword = confirmPasswordInput.value;
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }
            await createUserWithEmailAndPassword(auth, email, password);
            showMessage('Account created successfully! You are now logged in.', false);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            showMessage('Login successful!', false);
        }
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
                     friendlyMessage = "Invalid email or password.";
                     break;
                case 'auth/email-already-in-use':
                    friendlyMessage = "An account with this email already exists.";
                    break;
                case 'auth/weak-password':
                    friendlyMessage = "Password should be at least 6 characters.";
                    break;
                default:
                    friendlyMessage = error.message;
            }
        } else {
           friendlyMessage = error.message;
        }
        showMessage(friendlyMessage, true);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = isSignUpMode ? 'Create Account' : 'Sign In';
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
toggleModeLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});
logoutButton.addEventListener('click', handleLogout);

// --- Main Execution ---
// Listen for authentication state changes to manage the user's session.
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});
