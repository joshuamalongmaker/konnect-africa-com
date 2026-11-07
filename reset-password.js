const params = new URLSearchParams(window.location.search);
const email = params.get('email');
const token = params.get('token');
const resetRequestForm = document.getElementById('reset-request-form');
const resetPasswordForm = document.getElementById('reset-password-form');

if (token && email) {
  resetPasswordForm.style.display = '';
  document.getElementById('reset-title').textContent = 'Set a new password';
} else {
  resetRequestForm.style.display = '';
}

const submitResetRequest = async (event, endpoint, body, messageId, errorId) => {
  event.preventDefault();
  const message = document.getElementById(messageId);
  const error = document.getElementById(errorId);
  message.style.display = 'none';
  error.style.display = 'none';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Unable to complete the request.');
    message.textContent = data.message || 'If that email is registered, a reset link has been sent.';
    message.style.display = 'block';
  } catch (requestError) {
    error.textContent = requestError.message || 'Unable to connect. Please try again later.';
    error.style.display = 'block';
  }
};

resetRequestForm.addEventListener('submit', event => {
  const requestEmail = document.getElementById('reset-email').value.trim();
  submitResetRequest(event, '/api/request-password-reset', { email: requestEmail }, 'reset-request-msg', 'reset-request-err');
});

resetPasswordForm.addEventListener('submit', async event => {
  event.preventDefault();
  const password = document.getElementById('new-password').value;
  const message = document.getElementById('reset-password-msg');
  const error = document.getElementById('reset-password-err');
  message.style.display = 'none';
  error.style.display = 'none';

  try {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Password reset failed.');
    message.textContent = data.message || 'Password reset successful.';
    message.style.display = 'block';
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  } catch (requestError) {
    error.textContent = requestError.message || 'Unable to connect. Please try again later.';
    error.style.display = 'block';
  }
});
