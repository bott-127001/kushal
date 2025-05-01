// Additional imports for password reset and shipping API
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const EasyPost = require('@easypost/api');
const easyPostApiKey = 'your_easypost_api_key_here'; // Replace with your EasyPost API key
const easyPost = new EasyPost(easyPostApiKey);
require('dotenv').config();



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_here'; // Replace with a secure secret in production

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;




const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    address TEXT,
    contact_no TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Initialize password reset tokens table
db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT UNIQUE,
    expires_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Initialize OTP table for login, registration, and password reset
db.run(`CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    otp TEXT,
    type TEXT, -- 'login' or 'register' or 'password_reset'
    expires_at DATETIME
)`);

// Initialize wishlist table
db.run(`CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
)`);
    }
});

// Serve static files from current directory
const path = require('path');
app.use(express.static(path.join(__dirname)));

// Basic route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper function to generate 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(toEmail, otp, type) {
    const subject = type === 'login' ? 'Your Login OTP' : (type === 'password_reset' ? 'Your Password Reset OTP' : 'Your Registration OTP');
    const text = `Your OTP for ${type} is: ${otp}. It is valid for 10 minutes.`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: subject,
        text: text
    };

    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
}



// Endpoint to request registration OTP
app.post('/api/request-register-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }
        if (user) {
            return res.status(409).json({ error: 'User already exists.' });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in DB
        db.run('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, 'register', expiresAt.toISOString()], async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to store OTP.' });
            }
            try {
                await sendOtpEmail(email, otp, 'register');
                res.json({ message: 'OTP sent to your email.' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to send OTP email.' });
            }
        });
    });
});

// Endpoint to verify registration OTP and create user
app.post('/api/verify-register-otp', async (req, res) => {
    console.log('Received /api/verify-register-otp request body:', req.body);
    const { email, otp, name, address, contact_no } = req.body;
    const full_name = name;
    console.log('Parsed fields:', { email, otp, full_name, address, contact_no });
    if (!email || !otp || !full_name || !address || !contact_no) {
        return res.status(400).json({ error: 'Email, OTP, full name, address, and contact number are required.' });
    }

    // Additional validation to ensure no empty strings
    if (full_name.trim() === '' || address.trim() === '' || contact_no.trim() === '') {
        return res.status(400).json({ error: 'Full name, address, and contact number cannot be empty.' });
    }

    db.get('SELECT * FROM otps WHERE email = ? AND otp = ? AND type = ? ORDER BY expires_at DESC LIMIT 1', [email, otp, 'register'], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }
        if (!row) {
            return res.status(400).json({ error: 'Invalid OTP.' });
        }
        if (new Date(row.expires_at) < new Date()) {
            return res.status(400).json({ error: 'OTP has expired.' });
        }

        // OTP is valid, delete it
        db.run('DELETE FROM otps WHERE id = ?', [row.id], async (err) => {
            if (err) {
                console.error('Failed to delete OTP:', err);
            }
        });

        // Check if user already exists (race condition)
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            if (user) {
                return res.status(409).json({ error: 'User already exists.' });
            }

            // Create user with no password (or generate random password)
            const saltRounds = 10;
            const randomPassword = crypto.randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

            db.run('INSERT INTO users (email, password_hash, full_name, address, contact_no) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, full_name, address, contact_no], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user.' });
                }

                // Generate JWT token
                const token = jwt.sign({ id: this.lastID, email: email, is_admin: 0 }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ message: 'Registration successful.', token });
        });
    });
});
    });

// Middleware to verify JWT token and set req.user
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Middleware to check admin role
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Admin analytics dashboard endpoint
app.get('/api/admin/analytics', authenticateToken, requireAdmin, (req, res) => {
    const analytics = {};

    // Total sales and orders
    db.get('SELECT COUNT(*) AS total_orders, SUM(total) AS total_sales FROM orders', (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve sales data.' });
        }
        analytics.total_orders = row.total_orders || 0;
        analytics.total_sales = row.total_sales || 0;

        // User registrations count
        db.get('SELECT COUNT(*) AS total_users FROM users', (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to retrieve user data.' });
            }
            analytics.total_users = row.total_users || 0;

            // Recent orders count (last 30 days)
            db.get("SELECT COUNT(*) AS recent_orders FROM orders WHERE created_at >= datetime('now', '-30 days')", (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to retrieve recent orders data.' });
                }
                analytics.recent_orders = row.recent_orders || 0;

                // Recent user registrations (last 30 days)
                db.get("SELECT COUNT(*) AS recent_users FROM users WHERE created_at >= datetime('now', '-30 days')", (err, row) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to retrieve recent user data.' });
                    }
                    analytics.recent_users = row.recent_users || 0;

                    // Send analytics response
                    res.json(analytics);
                });
            });
        });
    });
});

app.post('/api/register', async (req, res) => {
    const { email, password, full_name, address, contact_no } = req.body;

    if (!email || !password || !full_name || !address || !contact_no) {
        return res.status(400).json({ error: 'Email, password, full name, address, and contact number are required.' });
    }

    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            if (row) {
                return res.status(409).json({ error: 'User already exists.' });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            db.run('INSERT INTO users (email, password_hash, full_name, address, contact_no) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, full_name, address, contact_no], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to register user.' });
                }
                return res.status(201).json({ message: 'User registered successfully.' });
            });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/api/password-reset-request', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    // Find user by email
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            // For security, respond with success even if user not found
            return res.json({ message: 'If the email exists, an OTP has been sent.' });
        }
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in otps table with type 'password_reset'
        db.run('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, 'password_reset', expiresAt.toISOString()], async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to store OTP.' });
            }
            // Send OTP email
            try {
                await sendOtpEmail(email, otp, 'password_reset');
                res.json({ message: 'If the email exists, an OTP has been sent.' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to send OTP email.' });
            }
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin === 1 }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful.', token, is_admin: user.is_admin === 1 });
    });
});

// Endpoint to request OTP for admin login
app.post('/api/request-login-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.is_admin !== 1) {
            return res.status(403).json({ error: 'Access denied. Not an admin user.' });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in DB
        db.run('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [email, otp, 'login', expiresAt.toISOString()], async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to store OTP.' });
            }
            try {
                await sendOtpEmail(email, otp, 'login');
                res.json({ message: 'OTP sent to your email.' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to send OTP email.' });
            }
        });
    });
});

// Endpoint to verify OTP for admin login
app.post('/api/verify-login-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    db.get('SELECT * FROM otps WHERE email = ? AND otp = ? AND type = ? ORDER BY expires_at DESC LIMIT 1', [email, otp, 'login'], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        if (new Date(row.expires_at) < new Date()) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (user.is_admin !== 1) {
                return res.status(403).json({ error: 'Access denied. Not an admin user.' });
            }

            // OTP verified, generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email, is_admin: true }, JWT_SECRET, { expiresIn: '1h' });

            // Delete used OTP
            db.run('DELETE FROM otps WHERE id = ?', [row.id], (err) => {
                if (err) {
                    console.error('Failed to delete OTP:', err);
                }
            });

            res.json({ message: 'OTP verified', token, is_admin: true });
        });
    });
});

// Initialize products table
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    subcategory TEXT,
    image TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Initialize product reviews table
db.run(`CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Get all products with search, filtering, and sorting
app.get('/api/products', (req, res) => {
    const { search, category, subcategory, minPrice, maxPrice, sortBy, sortOrder } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (subcategory) {
        query += ' AND subcategory = ?';
        params.push(subcategory);
    }
    if (minPrice) {
        query += ' AND price >= ?';
        params.push(minPrice);
    }
    if (maxPrice) {
        query += ' AND price <= ?';
        params.push(maxPrice);
    }
    if (sortBy) {
        const order = sortOrder && ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';
        const allowedSortBy = ['name', 'price', 'created_at', 'category', 'subcategory'];
        if (allowedSortBy.includes(sortBy)) {
            query += ` ORDER BY ${sortBy} ${order}`;
        }
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve products.' });
        }
        res.json(rows);
    });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve product.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json(row);
    });
});

// Get reviews for a product
app.get('/api/products/:id/reviews', (req, res) => {
    const productId = req.params.id;
    db.all('SELECT pr.id, pr.rating, pr.review, pr.created_at, u.email as user_email FROM product_reviews pr JOIN users u ON pr.user_id = u.id WHERE pr.product_id = ?', [productId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve product reviews.' });
        }
        res.json(rows);
    });
});

// Add a review for a product
app.post('/api/products/:id/reviews', (req, res) => {
    const productId = req.params.id;
    const { user_id, rating, review } = req.body;
    if (!user_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'User ID and rating (1-5) are required.' });
    }
    db.run('INSERT INTO product_reviews (product_id, user_id, rating, review) VALUES (?, ?, ?, ?)', [productId, user_id, rating, review || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to add product review.' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Create new product
app.post('/api/products', (req, res) => {
    const { name, description, price, category, subcategory, image, stock } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required.' });
    }
    db.run(
        'INSERT INTO products (name, description, price, category, subcategory, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, price, category, subcategory, image, stock || 0],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create product.' });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const { name, description, price, category, subcategory, image, stock } = req.body;
    db.run(
        'UPDATE products SET name = ?, description = ?, price = ?, category = ?, subcategory = ?, image = ?, stock = ? WHERE id = ?',
        [name, description, price, category, subcategory, image, stock, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update product.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found.' });
            }
            res.json({ message: 'Product updated successfully.' });
        }
    );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete product.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json({ message: 'Product deleted successfully.' });
    });
});

// Initialize orders table
db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT, -- JSON string of order items
    total REAL,
    shipping_address TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Create new order
app.post('/api/orders', (req, res) => {
    const { user_id, items, total, shipping_address, payment_method } = req.body;
    if (!user_id || !items || !total || !shipping_address || !payment_method) {
        return res.status(400).json({ error: 'Missing required order fields.' });
    }
    const itemsStr = JSON.stringify(items);
    db.run(
        'INSERT INTO orders (user_id, items, total, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)',
        [user_id, itemsStr, total, shipping_address, payment_method],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create order.' });
            }
            // Send order confirmation email
            db.get('SELECT email FROM users WHERE id = ?', [user_id], (err, row) => {
                if (err) {
                    console.error('Failed to get user email for order confirmation:', err);
                } else if (row && row.email) {
                    sendOrderConfirmationEmail(row.email, this.lastID);
                }
            });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Get orders by user ID
app.get('/api/orders/user/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    db.all('SELECT * FROM orders WHERE user_id = ?', [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve orders.' });
        }
        // Parse items JSON string
        const orders = rows.map(order => ({
            ...order,
            items: JSON.parse(order.items)
        }));
        res.json(orders);
    });
});

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve orders.' });
        }
        const orders = rows.map(order => ({
            ...order,
            items: JSON.parse(order.items)
        }));
        res.json(orders);
    });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
    }
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update order status.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        // Send shipping update email
        db.get('SELECT user_id FROM orders WHERE id = ?', [id], (err, orderRow) => {
            if (err) {
                console.error('Failed to get order for shipping update email:', err);
            } else if (orderRow) {
                db.get('SELECT email FROM users WHERE id = ?', [orderRow.user_id], (err, userRow) => {
                    if (err) {
                        console.error('Failed to get user email for shipping update:', err);
                    } else if (userRow && userRow.email) {
                        sendShippingUpdateEmail(userRow.email, id, status);
                    }
                });
            }
        });
        res.json({ message: 'Order status updated successfully.' });
    });
});

// Send shipping update email
async function sendShippingUpdateEmail(toEmail, orderId, status) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Order Shipping Update',
        text: `Your order ID ${orderId} status has been updated to: ${status}.`
    };
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Shipping update email sent:', info.response);
    } catch (error) {
        console.error('Error sending shipping update email:', error);
    }
}

// Initialize consultations table
db.run(`CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    service_type TEXT,
    scheduled_time DATETIME,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Initialize consultation reviews table
db.run(`CREATE TABLE IF NOT EXISTS consultation_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id INTEGER,
    user_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(consultation_id) REFERENCES consultations(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);


// Create new consultation booking
app.post('/api/consultations', (req, res) => {
    const { user_id, service_type, scheduled_time } = req.body;
    if (!user_id || !service_type || !scheduled_time) {
        return res.status(400).json({ error: 'Missing required consultation fields.' });
    }
    db.run(
        'INSERT INTO consultations (user_id, service_type, scheduled_time) VALUES (?, ?, ?)',
        [user_id, service_type, scheduled_time],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create consultation.' });
            }
            // Send consultation booking confirmation email
            db.get('SELECT email FROM users WHERE id = ?', [user_id], (err, row) => {
                if (err) {
                    console.error('Failed to get user email for consultation booking:', err);
                } else if (row && row.email) {
                    sendConsultationBookingEmail(row.email, this.lastID, service_type, scheduled_time);
                }
            });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Get consultations by user ID with search, filtering, and sorting
app.get('/api/consultations/user/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const { search, service_type, status, sortBy, sortOrder } = req.query;

    let query = 'SELECT * FROM consultations WHERE user_id = ?';
    const params = [user_id];

    if (search) {
        query += ' AND service_type LIKE ?';
        params.push(`%${search}%`);
    }
    if (service_type) {
        query += ' AND service_type = ?';
        params.push(service_type);
    }
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (sortBy) {
        const order = sortOrder && ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';
        const allowedSortBy = ['service_type', 'scheduled_time', 'status', 'created_at'];
        if (allowedSortBy.includes(sortBy)) {
            query += ` ORDER BY ${sortBy} ${order}`;
        }
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve consultations.' });
        }
        res.json(rows);
    });
});

// Get all consultations (admin)
app.get('/api/consultations', authenticateToken, requireAdmin, (req, res) => {
    db.all('SELECT * FROM consultations', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve consultations.' });
        }
        res.json(rows);
    });
});

// Get reviews for a consultation
app.get('/api/consultations/:id/reviews', (req, res) => {
    const consultationId = req.params.id;
    db.all('SELECT cr.id, cr.rating, cr.review, cr.created_at, u.email as user_email FROM consultation_reviews cr JOIN users u ON cr.user_id = u.id WHERE cr.consultation_id = ?', [consultationId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve consultation reviews.' });
        }
        res.json(rows);
    });
});

// Add a review for a consultation
app.post('/api/consultations/:id/reviews', (req, res) => {
    const consultationId = req.params.id;
    const { user_id, rating, review } = req.body;
    if (!user_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'User ID and rating (1-5) are required.' });
    }
    db.run('INSERT INTO consultation_reviews (consultation_id, user_id, rating, review) VALUES (?, ?, ?, ?)', [consultationId, user_id, rating, review || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to add consultation review.' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Update consultation status
app.put('/api/consultations/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
    }
    db.run('UPDATE consultations SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update consultation status.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Consultation not found.' });
        }
        res.json({ message: 'Consultation status updated successfully.' });
    });
});

app.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT id, email, full_name, address, contact_no, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve user profile.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(row);
    });
});

// Get all users (id and email only) for frontend usage
app.get('/api/users', (req, res) => {
    db.all('SELECT id, email FROM users', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve users.' });
        }
        res.json(rows);
    });
});

// Get wishlist for a user
app.get('/api/users/:id/wishlist', (req, res) => {
    const userId = req.params.id;
    db.all('SELECT w.id, p.id as product_id, p.name, p.description, p.price, p.image FROM wishlists w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve wishlist.' });
        }
        res.json(rows);
    });
});

// Add product to wishlist
app.post('/api/users/:id/wishlist', (req, res) => {
    const userId = req.params.id;
    const { product_id } = req.body;
    if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required.' });
    }
    db.run('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, product_id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to add to wishlist.' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Remove product from wishlist
app.delete('/api/users/:id/wishlist/:product_id', (req, res) => {
    const userId = req.params.id;
    const productId = req.params.product_id;
    db.run('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to remove from wishlist.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Wishlist item not found.' });
        }
        res.json({ message: 'Removed from wishlist successfully.' });
    });
});

app.put('/api/users/:id', async (req, res) => {

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    // Find user by email
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            // For security, respond with success even if user not found
            return res.json({ message: 'If the email exists, a reset link has been sent.' });
        }
        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry
        // Store token in DB
        db.run('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expiresAt.toISOString()], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save reset token' });
            }
            // Send reset email
            const resetUrl = `https://yourfrontend.com/reset-password?token=${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Click the link to reset your password: ${resetUrl}. This link expires in 1 hour.`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending password reset email:', error);
                } else {
                    console.log('Password reset email sent:', info.response);
                }
            });
            res.json({ message: 'If the email exists, a reset link has been sent.' });
        });
    });
});

// Password reset endpoint
app.post('/api/password-reset', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }
    // Find OTP in otps table and check expiry
    db.get('SELECT * FROM otps WHERE email = ? AND otp = ? AND type = ? ORDER BY expires_at DESC LIMIT 1', [email, otp, 'password_reset'], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        if (new Date(row.expires_at) < new Date()) {
            return res.status(400).json({ error: 'OTP has expired' });
        }
        // Hash new password
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            // Update user password
            db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update password' });
                }
                // Delete used OTP
                db.run('DELETE FROM otps WHERE id = ?', [row.id], (err) => {
                    if (err) {
                        console.error('Failed to delete used OTP:', err);
                    }
                });
                res.json({ message: 'Password has been reset successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: 'Error processing password reset' });
        }
    });
});

// Shipping rates endpoint using EasyPost
app.post('/api/shipping/rates', async (req, res) => {
    const { toAddress, fromAddress, parcel } = req.body;
    if (!toAddress || !fromAddress || !parcel) {
        return res.status(400).json({ error: 'toAddress, fromAddress, and parcel are required' });
    }
    try {
        const to = await easyPost.Address.create(toAddress);
        const from = await easyPost.Address.create(fromAddress);
        const parcelObj = await easyPost.Parcel.create(parcel);
        const shipment = await easyPost.Shipment.create({
            to_address: to,
            from_address: from,
            parcel: parcelObj
        });
        res.json({ rates: shipment.rates });
    } catch (error) {
        console.error('Error fetching shipping rates:', error);
        res.status(500).json({ error: 'Failed to fetch shipping rates' });
    }
});

// Shipping tracking endpoint using EasyPost
app.get('/api/shipping/track/:tracking_code', async (req, res) => {
    const trackingCode = req.params.tracking_code;
    if (!trackingCode) {
        return res.status(400).json({ error: 'Tracking code is required' });
    }
    try {
        const tracker = await easyPost.Tracker.create({ tracking_code: trackingCode });
        res.json({ tracker });
    } catch (error) {
        console.error('Error fetching tracking info:', error);
        res.status(500).json({ error: 'Failed to fetch tracking info' });
    }
});

// POST /api/request-email-update-otp endpoint
app.post('/api/request-email-update-otp', async (req, res) => {
    const { user_id, new_email } = req.body;
    if (!user_id || !new_email) {
        return res.status(400).json({ error: 'User ID and new email are required.' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in DB with type 'email_update' and new_email as extra info
    db.run('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)', [new_email, otp, 'email_update', expiresAt.toISOString()], async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to store OTP.' });
        }
        try {
            await sendOtpEmail(new_email, otp, 'email update');
            res.json({ message: 'OTP sent to your new email.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send OTP email.' });
        }
    });
});


// POST /api/verify-email-update-otp endpoint
app.post('/api/verify-email-update-otp', async (req, res) => {
    const { user_id, new_email, otp } = req.body;
    if (!user_id || !new_email || !otp) {
        return res.status(400).json({ error: 'User ID, new email, and OTP are required.' });
    }

    db.get('SELECT * FROM otps WHERE email = ? AND otp = ? AND type = ? ORDER BY expires_at DESC LIMIT 1', [new_email, otp, 'email_update'], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }
        if (!row) {
            return res.status(400).json({ error: 'Invalid OTP.' });
        }
        if (new Date(row.expires_at) < new Date()) {
            return res.status(400).json({ error: 'OTP has expired.' });
        }

        // OTP is valid, delete it
        db.run('DELETE FROM otps WHERE id = ?', [row.id], async (err) => {
            if (err) {
                console.error('Failed to delete OTP:', err);
            }
        });

        // Update user's email
        db.run('UPDATE users SET email = ? WHERE id = ?', [new_email, user_id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update email.' });
            }
            res.json({ message: 'Email updated successfully.' });
        });
    });
});

const rateLimit = require('express-rate-limit');

const Stripe = require('stripe');
const oauth2Client = new OAuth2(
    process.env.EMAIL_CLIENT_ID,
    process.env.EMAIL_CLIENT_SECRET,
    process.env.EMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.EMAIL_REFRESH_TOKEN
});

async function createTransporter() {
    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.EMAIL_CLIENT_ID,
            clientSecret: process.env.EMAIL_CLIENT_SECRET,
            refreshToken: process.env.EMAIL_REFRESH_TOKEN,
            accessToken: accessToken.token || accessToken
        }
    });
}

// Send order confirmation email
async function sendOrderConfirmationEmail(toEmail, orderId) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Order Confirmation',
        text: `Thank you for your order! Your order ID is ${orderId}. We will notify you when your order ships.`
    };
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.response);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
}

// Send shipping update email
async function sendShippingUpdateEmail(toEmail, orderId, status) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Order Shipping Update',
        text: `Your order ID ${orderId} status has been updated to: ${status}.`
    };
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Shipping update email sent:', info.response);
    } catch (error) {
        console.error('Error sending shipping update email:', error);
    }
}

// Send consultation booking confirmation email
async function sendConsultationBookingEmail(toEmail, consultationId, serviceType, scheduledTime) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Consultation Booking Confirmation',
        text: `Your consultation booking (ID: ${consultationId}) for service "${serviceType}" is confirmed for ${scheduledTime}.`
    };
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Consultation booking email sent:', info.response);
    } catch (error) {
        console.error('Error sending consultation booking email:', error);
    }
}

app.put('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Address is required to update.' });
    }

    try {
        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET address = ? WHERE id = ?', [address, id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ message: 'User profile updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user profile.' });
    }
});

