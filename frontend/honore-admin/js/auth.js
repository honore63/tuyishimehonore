/**
 * auth.js
 * Manages admin authentication session validation and login form handlers.
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberCheckbox = document.getElementById("remember-me");
  const errorAlert = document.getElementById("error-alert");
  const errorText = document.getElementById("error-text");
  const togglePassword = document.getElementById("toggle-password");
  const submitBtn = document.getElementById("submit-btn");

  // Authentication configuration
  const ADMIN_EMAIL = "tuyishimehonore63@gmail.com";
  // The default admin password that can be updated in Settings and is stored in localStorage
  const getAdminPassword = () => {
    return localStorage.getItem("admin_password") || "Honore@admin2026";
  };

  // Redirect if already logged in
  const checkSession = () => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in") === "true" || 
                       localStorage.getItem("admin_logged_in") === "true";
    if (isLoggedIn) {
      window.location.href = "dashboard.html";
    }
  };

  checkSession();

  // Password visibility visual toggler
  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    });
  }

  // Handle Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Hide previous alert
      errorAlert.style.display = "none";

      // Form validation
      if (!email || !password) {
        showError("Please enter both email and password.");
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Signing In...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

      setTimeout(() => {
        const correctPassword = getAdminPassword();
        if (email.toLowerCase() === ADMIN_EMAIL && password === correctPassword) {
          // Authentication successful
            if (rememberCheckbox.checked) {
              localStorage.setItem("admin_logged_in", "true");
            } else {
              sessionStorage.setItem("admin_logged_in", "true");
            }
            
            // Flag for dashboard.js to log the login activity
            sessionStorage.removeItem("just_logged_in");
            
            window.location.href = "dashboard.html";
        } else {
          // Authentication failed
          showError("Invalid email or password. Please try again.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Sign In</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
      }, 800); // Simulate network latency
    });
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorAlert.style.display = "flex";
  }
});
