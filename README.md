# Kaivalya Astrology E-commerce Project

## Project Structure

- `frontend/` - Contains all frontend files (HTML, CSS, JS, assets).
- `backend/` - Contains backend Node.js server, database, and related files.

## Setup and Deployment

### Backend

1. Navigate to the `backend/` directory.
2. Create a `.env` file with the following variables:

```
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key_here
EASYPOST_API_KEY=your_easypost_api_key_here
PORT=3001
```

3. Install dependencies:

```bash
npm install
```

4. Start the backend server:

```bash
npm start
```

The backend server will run on the port specified in `.env` (default 3001).

### Frontend

- The frontend files are located in the `frontend/` directory.
- You can serve the frontend using any static file server or open the HTML files directly in a browser.
- Ensure the backend server is running to enable API calls.

## Features

- User authentication (register, login, profile management)
- Product catalog with search, filter, and sorting
- Shopping cart and checkout with Stripe payment integration
- Wishlist management
- Consultation booking and management
- Order history and admin order management
- Password reset and account recovery
- Shipping rates and tracking integration with EasyPost
- Admin analytics dashboard

## Notes

- Update the `.env` file with your actual credentials and API keys.
- For production deployment, consider using HTTPS, secure JWT secrets, and environment-specific configurations.
- Add proper error handling and input validation as needed.
- This project uses SQLite for simplicity; consider migrating to a more robust database for production.

## License

MIT License
