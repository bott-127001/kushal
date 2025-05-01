document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('passwordResetRequestForm');
    const messageEl = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        const email = form.email.value.trim();

        if (!email) {
            messageEl.style.color = 'red';
            messageEl.textContent = 'Please enter your email address.';
            return;
        }

        try {
            const response = await fetch('/api/password-reset-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                messageEl.style.color = 'green';
                messageEl.textContent = data.message || 'If the email exists, a reset link has been sent.';
            } else {
                messageEl.style.color = 'red';
                messageEl.textContent = data.error || 'Failed to send reset link.';
            }
        } catch (error) {
            messageEl.style.color = 'red';
            messageEl.textContent = 'Error connecting to server.';
        }
    });
});
