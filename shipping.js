document.addEventListener('DOMContentLoaded', () => {
    const shippingRatesForm = document.getElementById('shippingRatesForm');
    const shippingRatesResult = document.getElementById('shippingRatesResult');
    const trackingForm = document.getElementById('trackingForm');
    const trackingResult = document.getElementById('trackingResult');

    shippingRatesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        shippingRatesResult.innerHTML = 'Loading shipping rates...';

        const toAddress = {
            street1: document.getElementById('toStreet').value.trim(),
            city: document.getElementById('toCity').value.trim(),
            state: document.getElementById('toState').value.trim(),
            zip: document.getElementById('toZip').value.trim(),
            country: document.getElementById('toCountry').value.trim()
        };

        const fromAddress = {
            street1: document.getElementById('fromStreet').value.trim(),
            city: document.getElementById('fromCity').value.trim(),
            state: document.getElementById('fromState').value.trim(),
            zip: document.getElementById('fromZip').value.trim(),
            country: document.getElementById('fromCountry').value.trim()
        };

        const parcel = {
            length: parseFloat(document.getElementById('parcelLength').value),
            width: parseFloat(document.getElementById('parcelWidth').value),
            height: parseFloat(document.getElementById('parcelHeight').value),
            weight: parseFloat(document.getElementById('parcelWeight').value)
        };

        try {
            const response = await fetch('/api/shipping/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toAddress, fromAddress, parcel })
            });
            const data = await response.json();
            if (response.ok) {
                if (data.rates && data.rates.length > 0) {
                    let ratesHtml = '<ul>';
                    data.rates.forEach(rate => {
                        ratesHtml += `<li>${rate.carrier} - ${rate.service}: $${rate.rate}</li>`;
                    });
                    ratesHtml += '</ul>';
                    shippingRatesResult.innerHTML = ratesHtml;
                } else {
                    shippingRatesResult.textContent = 'No shipping rates found.';
                }
            } else {
                shippingRatesResult.textContent = data.error || 'Failed to fetch shipping rates.';
            }
        } catch (error) {
            shippingRatesResult.textContent = 'Error connecting to server.';
        }
    });

    trackingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        trackingResult.textContent = 'Loading tracking information...';

        const trackingCode = document.getElementById('trackingCode').value.trim();
        if (!trackingCode) {
            trackingResult.textContent = 'Please enter a tracking code.';
            return;
        }

        try {
            const response = await fetch(`/api/shipping/track/${trackingCode}`);
            const data = await response.json();
            if (response.ok) {
                if (data.tracker && data.tracker.status) {
                    trackingResult.innerHTML = `
                        <p>Status: ${data.tracker.status}</p>
                        <p>Carrier: ${data.tracker.carrier}</p>
                        <p>Tracking Code: ${data.tracker.tracking_code}</p>
                        <p>Last Updated: ${data.tracker.updated_at}</p>
                    `;
                } else {
                    trackingResult.textContent = 'No tracking information found.';
                }
            } else {
                trackingResult.textContent = data.error || 'Failed to fetch tracking information.';
            }
        } catch (error) {
            trackingResult.textContent = 'Error connecting to server.';
        }
    });
});