function loginWithGitHub() {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      document.getElementById("welcome").textContent = `Hello, ${user.displayName || user.email || "GitHub User"}! 🎉`;
    })
    .catch(async (error) => {
      if (error.code === 'auth/account-exists-with-different-credential') {
        // Get the pending GitHub credential
        const pendingCred = error.credential;
        const email = error.email;

        // Ask Firebase what sign-in methods are already used for that email
        const methods = await auth.fetchSignInMethodsForEmail(email);

        if (methods[0] === 'google.com') {
          alert(`This email is already associated with Google login. Please sign in with Google first to link accounts.`);
        } else {
          alert(`This email is already used with another sign-in method: ${methods[0]}`);
        }

        // OPTIONAL: you can offer to log in with the other method and link credentials.
      } else {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
      }
    });
}
