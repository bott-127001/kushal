document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('passwordResetForm');
    const messageEl = document.getElementById('message');

    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        messageEl.style.color = 'red';
        messageEl.textContent = 'Invalid or missing password reset token.';
        form.style.display = 'none';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        const newPassword = form.newPassword.value.trim();

        if (!newPassword || newPassword.length < 6) {
            messageEl.style.color = 'red';
            messageEl.textContent = 'Please enter a new password with at least 6 characters.';
            return;
        }

        try {
            const response = await fetch('/api/password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            const data = await response.json();
            if (response.ok) {
                messageEl.style.color = 'green';
                messageEl.textContent = data.message || 'Password has been reset successfully.';
                form.reset();
            } else {
                messageEl.style.color = 'red';
                messageEl.textContent = data.error || 'Failed to reset password.';
            }
        } catch (error) {
            messageEl.style.color = 'red';
            messageEl.textContent = 'Error connecting to server.';
        }
    });
});