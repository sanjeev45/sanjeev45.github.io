// Import necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously,
    signInWithCustomToken,
    setPersistence,
    inMemoryPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
// These global variables are provided by the environment.
const firebaseConfig = {
    apiKey: "AIzaSyCp2uabmh3eg2Fjs0RBlrZBtn8XN0jAwlE",
    authDomain: "jora-d25ef.firebaseapp.com",
    projectId: "jora-d25ef",
    storageBucket: "jora-d25ef.firebasestorage.app",
    messagingSenderId: "1028125725395",
    appId: "1:1028125725395:web:8df1a67fc4a376b1197a26"
  };

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug'); // Enable debug logging for Firestore

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
        // Adjust border radius for better aesthetics
        passwordInput.classList.remove('rounded-b-md');
    } else {
        formTitle.textContent = 'Login';
        submitButton.textContent = 'Sign In';
        toggleModeLink.innerHTML = 'Need an account? <span class="font-bold">Sign Up</span>';
        confirmPasswordContainer.style.display = 'none';
        confirmPasswordInput.required = false;
        // Adjust border radius
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
    if (user) {
        // User is signed in
        loggedInView.style.display = 'block';
        formView.style.display = 'none';
        userEmailElement.textContent = user.email;
    } else {
        // User is signed out
        loggedInView.style.display = 'none';
        formView.style.display = 'block';
        // Reset to login mode
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
    showMessage(''); // Clear previous messages

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        if (isSignUpMode) {
            // --- Sign Up Logic ---
            const confirmPassword = confirmPasswordInput.value;
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }
            if (password.length < 6) {
                throw new Error("Password should be at least 6 characters.");
            }
            await createUserWithEmailAndPassword(auth, email, password);
            showMessage('Account created successfully! You are now logged in.', false);
        } else {
            // --- Login Logic ---
            await signInWithEmailAndPassword(auth, email, password);
            showMessage('Login successful!', false);
        }
        authForm.reset();
    } catch (error) {
        console.error("Authentication Error:", error);
        // Provide user-friendly error messages
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
                    friendlyMessage = "Password is too weak. It should be at least 6 characters.";
                    break;
                default:
                    friendlyMessage = error.message;
            }
        } else {
           friendlyMessage = error.message;
        }
        showMessage(friendlyMessage, true);
    } finally {
        // Re-enable the button and reset its text
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

// Listen for authentication state changes and update the UI accordingly.
// This is the primary way to manage the user's session.
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Attempt to sign in with a custom token if provided by the environment.
// Falls back to anonymous sign-in if no token is available.
(async () => {
    try {
        // Use in-memory persistence to avoid session conflicts in this environment
        await setPersistence(auth, inMemoryPersistence);

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            console.log("Attempting to sign in with custom token...");
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            console.log("No custom token found, signing in anonymously...");
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Initial sign-in error:", error);
        showMessage("Could not initialize session. Please refresh.", true);
    }
})();
