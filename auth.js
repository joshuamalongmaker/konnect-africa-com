const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const passwordToggle = document.getElementById('toggle-password');
if (passwordToggle) {
  passwordToggle.addEventListener('click', () => {
    const password = document.getElementById('password');
    const showPassword = password.type === 'password';
    password.type = showPassword ? 'text' : 'password';
    passwordToggle.textContent = showPassword ? 'Hide' : 'Show';
    passwordToggle.setAttribute('aria-pressed', String(showPassword));
  });
}

const submitCredentials = async (form, endpoint, errorId, isRegistration) => {
  const error = document.getElementById(errorId);
  const submitButton = form.querySelector('button[type="submit"]');
  error.textContent = '';
  error.style.display = 'none';
  submitButton.disabled = true;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      })
    });
    const data = await response.json();

    if (!response.ok) {
      error.textContent = data.message || 'Unable to complete your request.';
      error.style.display = 'block';
      return;
    }

    if (isRegistration) {
      window.location.href = 'login.html';
      return;
    }

    if (typeof data.token !== 'string') {
      throw new Error('The server returned an invalid sign-in response.');
    }
    sessionStorage.setItem('token', data.token);
    window.location.href = 'index.html';
  } catch {
    error.textContent = 'Unable to connect. Please try again later.';
    error.style.display = 'block';
  } finally {
    submitButton.disabled = false;
  }
};

if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    submitCredentials(loginForm, '/api/login', 'login-error', false);
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', event => {
    event.preventDefault();
    submitCredentials(registerForm, '/api/register', 'register-error', true);
  });
}
