import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import Stripe from 'stripe'
import fetch from 'node-fetch'
import multer from 'multer'
import fs from 'fs'
import crypto from 'crypto'
import 'dotenv/config'

const app = express()
app.use(cors({
  origin: [
    'http://localhost:3000', // For local development
    'https://kushal-15gt.onrender.com' // Your Render production domain
  ],
  credentials: true
}))
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here' // Use env var in production

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here', {
  apiVersion: '2023-10-16'
})

// PhonePe Configuration
const PHONEPE_CONFIG = {
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || 'your_phonepe_merchant_id_here',
  SALT_KEY: process.env.PHONEPE_SALT_KEY || 'your_phonepe_salt_key_here',
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX || 'your_phonepe_salt_index_here',
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/hermes'
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://samarthsalgar02:jDD9idZrfTLC9Y6u@cluster0.b24xtrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  birthDate: { type: Date },
  zodiacSign: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  notificationPreferences: {
    promotions: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true }
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      price: String,
      image: String,
      quantity: { type: Number, default: 1 }
    }
  ],
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date,
  otpRequests: { type: [Date], default: [] },
  isVerified: { type: Boolean, default: false }
})
const User = mongoose.model('User', userSchema)

// Product model
const productSchema = new mongoose.Schema({
  image: String,
  title: String,
  description: String,
  price: String,
  originalPrice: String,
  category: String,
  material: String,
  style: String,
  popularity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  specs: [String] // <-- Add this line for specifications
})
const Product = mongoose.model('Product', productSchema)

// Review model
const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})
const Review = mongoose.model('Review', reviewSchema)

// Order model
const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' }, // Can be 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  createdAt: { type: Date, default: Date.now },
  paymentIntentId: String
})
const Order = mongoose.model('Order', orderSchema)

// Consultation model
const consultationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  phone: String,
  dob: String,
  tob: String,
  pob: String,
  package: String,
  date: String, // YYYY-MM-DD
  slot: String, // e.g., '09:00 AM'
  questions: String,
  roomUrl: String, // Whereby room link
  createdAt: { type: Date, default: Date.now },
  accessTime: Date
})
const Consultation = mongoose.model('Consultation', consultationSchema)

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key_here'
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'your_sendgrid_from_email_here'

console.log('SENDGRID_API_KEY:', SENDGRID_API_KEY ? SENDGRID_API_KEY.slice(0,8) + '...' : 'NOT SET') // Remove after testing

// Configure nodemailer for SendGrid
// 1. Set SENDGRID_API_KEY in your environment variables
// 2. Use 'apikey' as the user and your actual API key as the pass
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'apikey', // This is literally the string 'apikey', not your username
    pass: SENDGRID_API_KEY
  }
})

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, '../client/public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage })

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    console.log(`Registration attempt for email: ${email}`)
    const existing = await User.findOne({ email })
    if (existing) {
      console.log(`User exists with email: ${email}, password: ${existing.password}, isVerified: ${existing.isVerified}`)
      // Check if this is a temporary user created during OTP request
      if (existing.password === 'temp' && existing.isVerified) {
        console.log(`Updating temporary user for email: ${email}`)
        // Update the temporary user with real password
        const hash = await bcrypt.hash(password, 10)
        existing.password = hash
        if (name) existing.name = name
        await existing.save()
        console.log(`Successfully updated temporary user for email: ${email}`)
        res.json({ success: true, user: { email: existing.email } })
      } else {
        console.log(`Real user already exists for email: ${email}`)
        // Real user already exists
        return res.status(409).json({ error: 'Email already registered' })
      }
    } else {
      console.log(`Creating new user for email: ${email}`)
      // Create new user
      const hash = await bcrypt.hash(password, 10)
      const user = await User.create({ email, password: hash, name })
      console.log(`Successfully created new user for email: ${email}`)
      res.json({ success: true, user: { email: user.email } })
    }
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    console.log(`Login attempt for email: ${email}`)
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`No user found for email: ${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    console.log(`User found for email: ${email}, password type: ${user.password === 'temp' ? 'temp' : 'hashed'}`)
    
    // Prevent login for temporary users that haven't been properly registered
    if (user.password === 'temp') {
      console.log(`Login blocked for temporary user: ${email}`)
      return res.status(401).json({ error: 'Please complete your registration first' })
    }
    
    const match = await bcrypt.compare(password, user.password)
    console.log(`Password match for ${email}: ${match}`)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    console.log(`Login successful for email: ${email}`)
    res.json({ success: true, token, user: { email: user.email } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Admin login endpoint
const ADMIN_CODE = process.env.ADMIN_CODE || 'superadmincode' // Set in env in production

app.post('/api/admin/login', async (req, res) => {
  const { email, password, adminCode } = req.body
  if (!email || !password || !adminCode) return res.status(400).json({ error: 'Email, password, and admin code required' })
  try {
    const user = await User.findOne({ email })
    if (!user || !user.isAdmin) return res.status(401).json({ error: 'Not authorized as admin' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    if (adminCode !== ADMIN_CODE) return res.status(401).json({ error: 'Invalid admin code' })
    const token = jwt.sign({ userId: user._id, email: user.email, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, user: { email: user.email, isAdmin: true } })
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed' })
  }
})

function authenticateJWT (req, res, next) {
  const authHeader = req.headers.authorization
  // console.log('Authorization header:', authHeader)
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log('JWT verification error:', err)
        return res.sendStatus(403) // Forbidden
      }
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401) // Unauthorized
  }
}

// Mock data
const gemstones = [
  { _id: '60f7c0b8e1d3f8a1b1a1a1a1', name: 'Ruby', sign: 'Mars Signs', price: '$1,299', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a2', name: 'Sapphire', sign: 'Mercury Signs', price: '$999', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a3', name: 'Emerald', sign: 'Venus Signs', price: '$1,499', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a4', name: 'Amethyst', sign: 'Jupiter Signs', price: '$899', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a5', name: 'Diamond', sign: 'Sun Signs', price: '$2,499', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a6', name: 'Topaz', sign: 'Saturn Signs', price: '$799', image: '' }
]

const services = [
  { title: 'Personal Gemstone Reading', duration: '60 minutes', price: '$199', icon: '', description: 'Discover which gemstones align with your unique astrological profile. Receive tailored recommendations to enhance your well-being and success.' },
  { title: 'Birth Chart Analysis', duration: '90 minutes', price: '$299', icon: '', description: 'Uncover the secrets of your natal chart and planetary influences. Gain deep insights into your strengths, challenges, and life path.' },
  { title: 'Crystal Healing Session', duration: '45 minutes', price: '$149', icon: '', description: 'Experience the restorative power of crystals chosen for your energy. Learn how to use them for balance, healing, and personal growth.' }
]

// Blog model
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  readTime: { type: String, required: true },
  summary: { type: String },
  content: { type: String, required: true }, // For now, plain string. Can be blocks/rich text later.
  tags: [String],
  image: String,
  images: [String], // Array of image URLs for blog content
  relatedProducts: [String] // Array of product IDs or names
})
const Blog = mongoose.model('Blog', blogSchema)

// Update /api/insights to return latest 3 blogs
app.get('/api/insights', async (req, res) => {
  try {
    const insights = await Blog.find().sort({ date: -1 }).limit(3)
    res.json(insights)
  } catch (err) {
    console.error('Error in /api/insights:', err)
    res.status(500).json({ error: 'Failed to fetch insights' })
  }
})

// GET /api/products with pagination and sorting
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8
    const sortBy = req.query.sortBy || 'title'
    const order = req.query.order === 'desc' ? -1 : 1
    const search = req.query.search || ''
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : null
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null

    const skip = (page - 1) * limit
    const sortObj = { [sortBy]: order }

    let filter = {}
    if (search) {
      filter.$text = { $search: search }
    }
    if (minPrice !== null || maxPrice !== null) {
      filter.$expr = { $and: [] }
      if (minPrice !== null) {
        filter.$expr.$and.push({ $gte: [ { $toInt: { $replaceAll: { input: "$price", find: /[^0-9]/g, replacement: "" } } }, minPrice ] })
      }
      if (maxPrice !== null) {
        filter.$expr.$and.push({ $lte: [ { $toInt: { $replaceAll: { input: "$price", find: /[^0-9]/g, replacement: "" } } }, maxPrice ] })
      }
      if (!filter.$expr.$and.length) delete filter.$expr
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ])

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Seed endpoint for mock products (one-time use)
app.post('/api/products/seed', async (req, res) => {
  const mockProducts = [
    {
      image: 'https://via.placeholder.com/100x100?text=Ring',
      title: 'Diamond Solitaire Ring',
      description: 'A classic diamond ring for every occasion.',
      price: '$2499',
      category: 'Rings',
      material: 'Gold',
      style: 'Classic'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Earring',
      title: 'Pearl Drop Earrings',
      description: 'Elegant pearl earrings for a timeless look.',
      price: '$899',
      category: 'Earrings',
      material: 'Silver',
      style: 'Modern'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Necklace',
      title: 'Gold Chain Necklace',
      description: 'Handcrafted gold necklace with intricate design.',
      price: '$2899',
      category: 'Necklaces',
      material: 'Gold',
      style: 'Vintage'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Bracelet',
      title: 'Sapphire Tennis Bracelet',
      description: 'A stunning bracelet with blue sapphires.',
      price: '$1800',
      category: 'Bracelets',
      material: 'Platinum',
      style: 'Contemporary'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Necklace',
      title: 'Ruby Pendant',
      description: 'A beautiful ruby pendant for special moments.',
      price: '$1599',
      category: 'Necklaces',
      material: 'Gold',
      style: 'Classic'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Earring',
      title: 'Diamond Stud Earrings',
      description: 'Sparkling diamond studs for everyday wear.',
      price: '$1000',
      category: 'Earrings',
      material: 'Silver',
      style: 'Modern'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Ring',
      title: 'Emerald Ring',
      description: 'A vibrant emerald ring for a pop of color.',
      price: '$2850',
      category: 'Rings',
      material: 'Gold',
      style: 'Vintage'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Bracelet',
      title: 'Gold Bangle',
      description: 'A classic gold bangle for every wrist.',
      price: '$799',
      category: 'Bracelets',
      material: 'Gold',
      style: 'Classic'
    }
  ]
  try {
    await Product.deleteMany({})
    const inserted = await Product.insertMany(mockProducts)
    res.json({ success: true, count: inserted.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed products' })
  }
})

app.get('/api/gemstones', (req, res) => res.json(gemstones))
app.get('/api/services', (req, res) => res.json(services))

// POST /api/products (admin)
app.post('/api/products', adminAuth, async (req, res) => {
  try {
    const { price, originalPrice } = req.body
    if (!price || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Discounted price is required and must be a number' })
    }
    if (originalPrice && isNaN(Number(originalPrice))) {
      return res.status(400).json({ error: 'Original price must be a number' })
    }
    req.body.price = String(price)
    if (originalPrice) req.body.originalPrice = String(originalPrice)
    // req.body.image should be a base64 string
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' })
  }
})

// PUT /api/products/:id (admin)
app.put('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const { price, originalPrice } = req.body
    if (!price || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Discounted price is required and must be a number' })
    }
    if (originalPrice && isNaN(Number(originalPrice))) {
      return res.status(400).json({ error: 'Original price must be a number' })
    }
    req.body.price = String(price)
    if (originalPrice) req.body.originalPrice = String(originalPrice)
    // req.body.image should be a base64 string
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/products/:id (admin)
app.delete('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.post('/api/newsletter', (req, res) => {
  // For now, just return success
  res.json({ success: true })
})

// GET /api/products/recommendations?exclude=1,2,3
app.get('/api/products/recommendations', async (req, res) => {
  try {
    const excludeIds = (req.query.exclude || '').split(',').filter(Boolean)
    const filter = excludeIds.length ? { _id: { $nin: excludeIds } } : {}
    const count = await Product.countDocuments(filter)
    const randomSkip = count > 4 ? Math.floor(Math.random() * (count - 4 + 1)) : 0
    const recommendations = await Product.find(filter).skip(randomSkip).limit(4)
    res.json(recommendations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// In-memory reviews store (mock, resets on server restart)
const productReviews = {}

// GET /api/products/:id/reviews (mock)
app.get('/api/products/:id/reviews', (req, res) => {
  const id = req.params.id
  if (!productReviews[id]) {
    productReviews[id] = [
      { user: 'Amit S.', rating: 5, comment: 'Absolutely stunning timepiece. Worth every penny!' },
      { user: 'Priya K.', rating: 4, comment: 'Beautiful craftsmanship and fast shipping.' }
    ]
  }
  res.json(productReviews[id])
})

// POST /api/products/:id/reviews (mock)
app.post('/api/products/:id/reviews', (req, res) => {
  const id = req.params.id
  const { user, rating, comment } = req.body
  if (!user || !rating || !comment) return res.status(400).json({ error: 'All fields required' })
  if (!productReviews[id]) productReviews[id] = []
  productReviews[id].unshift({ user, rating, comment })
  res.json(productReviews[id])
})

// POST /api/orders - create a new order (protected)
app.post('/api/orders', authenticateJWT, async (req, res) => {
  const { email, phone, name, address, city, zip, country, items, subtotal, shipping, tax, total } = req.body
  if (!email || !phone || !name || !address || !city || !zip || !country || !items || !subtotal || !total) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const order = await Order.create({
      email, phone, name, address, city, zip, country, items, subtotal, shipping, tax, total
    })
    
    // Increment popularity for each product in the order
    const productIds = items.map(item => item.productId || item._id).filter(Boolean)
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { popularity: 1 } }
      )
    }
    
    res.json({ success: true, orderId: order._id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' })
  }
})

// GET /api/consultations/slots?date=YYYY-MM-DD
app.get('/api/consultations/slots', async (req, res) => {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Date is required' })
  const allSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM'
  ]
  try {
    const bookings = await Consultation.find({ date })
    const bookedSlots = bookings.map(b => b.slot)
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot))
    res.json({ availableSlots })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

// Settings model for global flags
const settingsSchema = new mongoose.Schema({
  isConsultationBlocked: { type: Boolean, default: false },
  consultationBlockedUntil: { type: Date, default: null }
})
const Settings = mongoose.model('Settings', settingsSchema)

// Helper to get or create settings doc
async function getSettings() {
  let settings = await Settings.findOne()
  if (!settings) settings = await Settings.create({})
  return settings
}

// GET /api/settings/consultation-blocked
app.get('/api/settings/consultation-blocked', async (req, res) => {
  try {
    const settings = await getSettings()
    res.json({
      isConsultationBlocked: settings.isConsultationBlocked,
      consultationBlockedUntil: settings.consultationBlockedUntil
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// PUT /api/settings/consultation-blocked (admin only)
app.put('/api/settings/consultation-blocked', adminAuth, async (req, res) => {
  try {
    const { isConsultationBlocked, consultationBlockedUntil } = req.body
    const settings = await getSettings()
    if (typeof isConsultationBlocked !== 'undefined') {
      settings.isConsultationBlocked = !!isConsultationBlocked
    }
    if (typeof consultationBlockedUntil !== 'undefined') {
      settings.consultationBlockedUntil = consultationBlockedUntil ? new Date(consultationBlockedUntil) : null
    }
    await settings.save()
    res.json({
      isConsultationBlocked: settings.isConsultationBlocked,
      consultationBlockedUntil: settings.consultationBlockedUntil
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// POST /api/consultations (JWT protected, prevents double-booking)
app.post('/api/consultations', authenticateJWT, async (req, res) => {
  // Block booking if admin has set the flag
  const settings = await getSettings()
  if (settings.isConsultationBlocked) {
    return res.status(423).json({ error: 'Consultations are temporarily unavailable. Please try again later.' })
  }
  // Block booking if requested date is in blackout period
  if (settings.consultationBlockedUntil) {
    const reqDate = new Date(req.body.date)
    if (reqDate <= settings.consultationBlockedUntil) {
      return res.status(423).json({ error: `Consultations are unavailable until ${settings.consultationBlockedUntil.toLocaleDateString()}. Please select a later date.` })
    }
  }
  console.log('Consultation payload:', req.body)
  const { dob, tob, pob, package: pkg, date, slot, questions } = req.body
  if (!dob || !tob || !pob || !pkg || !date || !slot) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    // Fetch user info from DB
    const user = await User.findById(req.user.userId)
    console.log('Fetched user:', user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const name = user.name
    const email = user.email
    // Prevent double-booking
    const exists = await Consultation.findOne({ date, slot })
    if (exists) return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' })

    // Use a static Whereby room URL for all consultations
    const roomUrl = 'https://whereby.com/kaivaylya-aastrology' // <-- Replace with your actual room name

    // Calculate when the room should be accessible (5 minutes before slot)
    function parseSlotTo24Hour(slot) {
      // slot: "09:00 AM" or "05:00 PM"
      const [time, modifier] = slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return { hours, minutes }
    }

    const { hours, minutes } = parseSlotTo24Hour(slot)
    const slotDateTime = new Date(date)
    slotDateTime.setHours(hours, minutes, 0, 0)
    const accessTime = new Date(slotDateTime.getTime() - 5 * 60000)

    const consultation = await Consultation.create({
      userId: req.user.userId,
      name, email, dob, tob, pob, package: pkg, date, slot, questions, roomUrl, accessTime
    })

    console.log('Before sending email')
    const mailOptions = {
      from: process.env.GMAIL_USER || 'kuchbhilelo107@gmail.com',
      to: email,
      subject: 'Your Consultation Booking is Confirmed',
      html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border-radius:12px;background:#faf9fb;border:1px solid #eee;">
        <h2 style="color:#D4AF37;">Thank you for booking your consultation!</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>Your consultation is confirmed with the following details:</p>
        <ul>
          <li><b>Package:</b> ${pkg}</li>
          <li><b>Date:</b> ${date}</li>
          <li><b>Time:</b> ${slot}</li>
          <li><b>Join Call:</b> <a href="${roomUrl}">${roomUrl}</a></li>
        </ul>
        <p>We look forward to guiding you on your journey.<br/>If you have any questions, reply to this email.</p>
        <p style="color:#888;font-size:13px;margin-top:24px;">Celestial Gems Team</p>
      </div>`
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email send error:', err)
      } else {
        console.log('Email sent:', info)
      }
    })
    console.log('After sending email (async)')
    res.json({ success: true, consultationId: consultation._id, roomUrl })
  } catch (err) {
    console.error('General error in /api/consultations:', err)
    res.status(500).json({ error: 'Failed to book consultation' })
  }
})

// GET /api/blogs (list, with pagination, search, filter, sort)
app.get('/api/blogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8
    const search = req.query.search || ''
    const tag = req.query.tag || ''
    const sortBy = req.query.sortBy || 'date'
    const order = req.query.order === 'asc' ? 1 : -1
    const skip = (page - 1) * limit
    const filter = {}
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    if (tag) {
      filter.tags = tag
    }
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ [sortBy]: order }).skip(skip).limit(limit),
      Blog.countDocuments(filter)
    ])
    res.json({ blogs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Error in /api/blogs:', err)
    res.status(500).json({ error: 'Failed to fetch blogs' })
  }
})

// GET /api/blogs/:id (get single blog)
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog' })
  }
})

// POST /api/blogs (create blog)
app.post('/api/blogs', async (req, res) => {
  try {
    const { title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts } = req.body
    const blog = await Blog.create({ title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' })
  }
})

// PUT /api/blogs/:id (update blog)
app.put('/api/blogs/:id', async (req, res) => {
  try {
    const { title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts } = req.body
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts },
      { new: true }
    )
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' })
  }
})

// DELETE /api/blogs/:id (delete blog)
app.delete('/api/blogs/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' })
  }
})

// Admin auth middleware
function adminAuth (req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ error: 'No token provided' })
  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Admin access required' })
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

app.put('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { name, phone, birthDate, zodiacSign, location } = req.body
    user.name = name || user.name
    user.phone = phone || user.phone
    user.birthDate = birthDate || user.birthDate
    user.zodiacSign = zodiacSign || user.zodiacSign
    user.location = location || user.location

    const updatedUser = await user.save()
    const userResponse = updatedUser.toObject()
    delete userResponse.password

    res.json(userResponse)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user profile' })
  }
})

// --- User-facing ---
// GET /api/my-orders (user)
app.get('/api/my-orders', authenticateJWT, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// --- Admin Order Management ---
// GET /api/orders (admin)
app.get('/api/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// PUT /api/orders/:id/status (admin)
app.put('/api/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// DELETE /api/orders/:id (admin)
app.delete('/api/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ success: true, message: 'Order deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' })
  }
})

// GET /api/consultations/all (admin)
app.get('/api/consultations/all', adminAuth, async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ date: -1 })
    res.json({ consultations })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' })
  }
})

app.get('/api/consultations', authenticateJWT, async (req, res) => {
  try {
    const consultations = await Consultation.find({ userId: req.user.userId }).sort({ date: -1 })
    res.json(consultations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' })
  }
})

app.post('/api/account/change-password', authenticateJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const { userId } = req.user

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' })
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' })
  }
})

app.put('/api/account/notification-preferences', authenticateJWT, async (req, res) => {
  const { preferences } = req.body
  const { userId } = req.user

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationPreferences: preferences } },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification preferences' })
  }
})

app.delete('/api/account/delete', authenticateJWT, async (req, res) => {
  const { password } = req.body
  const { userId } = req.user

  if (!password) {
    return res.status(400).json({ error: 'Password is required to delete account' })
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    // Optional: Handle deletion of associated data (e.g., orders, consultations) here
    // For now, we will just delete the user.

    await User.findByIdAndDelete(userId)

    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

// --- Admin User Management ---
// GET /api/users (admin)
app.get('/api/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// PUT /api/users/:id/block (admin)
app.put('/api/users/:id/block', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'User blocked' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user' })
  }
})

// PUT /api/users/:id/unblock (admin)
app.put('/api/users/:id/unblock', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'User unblocked' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock user' })
  }
})

// DELETE /api/users/:id (admin)
app.delete('/api/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// --- Shopping Cart Endpoints ---
// GET /api/cart (get current user's cart)
app.get('/api/cart', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ cart: user.cart || [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// POST /api/cart/add (add item to cart)
app.post('/api/cart/add', authenticateJWT, async (req, res) => {
  const { productId, title, price, image, quantity } = req.body
  if (!productId || !title || !price) {
    return res.status(400).json({ error: 'Missing product info' })
  }
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const existing = user.cart.find(item => item.productId.toString() === productId)
    if (existing) {
      existing.quantity += quantity || 1
    } else {
      user.cart.push({ productId, title, price, image: image || '', quantity: quantity || 1 })
    }
    await user.save()
    res.json({ cart: user.cart })
  } catch (err) {
    console.error('Failed to add to cart:', err)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// POST /api/cart/remove (remove item from cart)
app.post('/api/cart/remove', authenticateJWT, async (req, res) => {
  const { productId } = req.body
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.cart = user.cart.filter(item => item.productId.toString() !== productId)
    await user.save()
    res.json({ cart: user.cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
})

// POST /api/cart/update (update quantity)
app.post('/api/cart/update', authenticateJWT, async (req, res) => {
  const { productId, quantity } = req.body
  if (!productId || typeof quantity !== 'number') return res.status(400).json({ error: 'Missing productId or quantity' })
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const item = user.cart.find(i => i.productId.toString() === productId)
    if (!item) return res.status(404).json({ error: 'Item not found in cart' })
    item.quantity = quantity
    await user.save()
    res.json({ cart: user.cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// POST /api/cart/clear (clear cart)
app.post('/api/cart/clear', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.cart = []
    await user.save()
    res.json({ cart: [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

// POST /api/checkout (create order from cart and clear cart)
app.post('/api/checkout', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!user.cart || user.cart.length === 0) return res.status(400).json({ error: 'Cart is empty' })

    // Calculate totals (assume price is a string like "$1299" or "$1,299")
    let subtotal = 0
    user.cart.forEach(item => {
      const priceNum = Number(String(item.price).replace(/[^\d.]/g, ''))
      subtotal += priceNum * (item.quantity || 1)
    })
    const shipping = 100 // Flat shipping for now
    const tax = Math.round(subtotal * 0.1)
    const total = subtotal + shipping + tax

    // Create order
    const order = await Order.create({
      email: user.email,
      phone: user.phone || '',
      name: user.name || '',
      address: req.body.address || '',
      city: req.body.city || '',
      zip: req.body.zip || '',
      country: req.body.country || '',
      items: user.cart,
      subtotal,
      shipping,
      tax,
      total
    })

    // Clear cart
    user.cart = []
    await user.save()

    res.json({ success: true, orderId: order._id })
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed' })
  }
})

// --- Stripe Payment Endpoints ---
// POST /api/payment/create-payment-intent
app.post('/api/payment/create-payment-intent', authenticateJWT, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.userId
      }
    })

    res.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (err) {
    console.error('Payment intent creation failed:', err)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

// POST /api/payment/confirm-payment
app.post('/api/payment/confirm-payment', authenticateJWT, async (req, res) => {
  try {
    const { paymentIntentId, orderDetails } = req.body
    
    if (!paymentIntentId || !orderDetails) {
      return res.status(400).json({ error: 'Missing payment or order details' })
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    // Create order in database
    const order = await Order.create({
      ...orderDetails,
      paymentIntentId,
      status: 'Paid'
    })

    // Clear user's cart
    const user = await User.findById(req.user.userId)
    if (user) {
      user.cart = []
      await user.save()
    }

    res.json({ 
      success: true, 
      orderId: order._id,
      message: 'Payment successful and order created'
    })
  } catch (err) {
    console.error('Payment confirmation failed:', err)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

// POST /api/payment/webhook (for handling Stripe webhooks)
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret'

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log('Payment succeeded:', paymentIntent.id)
      // You can add additional logic here like sending confirmation emails
      break
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      console.log('Payment failed:', failedPayment.id)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })
  
  try {
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' })
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })
    
    // Save token to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    // Send reset email
    const resetUrl = `https://kushal-15gt.onrender.com/reset-password?token=${resetToken}`
    const mailOptions = {
      from: process.env.GMAIL_USER || 'kuchbhilelo107@gmail.com',
      to: email,
      subject: 'Password Reset Request - Celestial Gems',
      html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border-radius:12px;background:#faf9fb;border:1px solid #eee;">
        <h2 style="color:#D4AF37;">Password Reset Request</h2>
        <p>Hi <b>${user.name || 'there'}</b>,</p>
        <p>You requested a password reset for your Celestial Gems account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p style="color:#888;font-size:13px;margin-top:24px;">Celestial Gems Team</p>
      </div>`
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Password reset email error:', err)
        return res.status(500).json({ error: 'Failed to send reset email' })
      }
    })

    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' })
  } catch (err) {
    console.error('Password reset error:', err)
    res.status(500).json({ error: 'Failed to process password reset request' })
  }
})

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' })
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Password has been reset successfully' })
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }
    console.error('Password reset error:', err)
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

// --- Admin Analytics Endpoints ---
// GET /api/admin/analytics/dashboard
app.get('/api/admin/analytics/dashboard', adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get total sales in last 30 days
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ])

    // Get new user signups in last 30 days
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isAdmin: { $ne: true }
    })

    // Get most recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email total status createdAt items')

    // Get most popular products
    const popularProducts = await Product.find()
      .sort({ popularity: -1 })
      .limit(10)
      .select('title price popularity image')

    // Get sales trend for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailySales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Get consultation bookings in last 30 days
    const consultationBookings = await Consultation.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    res.json({
      totalSales: salesData[0]?.totalSales || 0,
      orderCount: salesData[0]?.orderCount || 0,
      newUsers,
      recentOrders,
      popularProducts,
      salesTrend,
      consultationBookings
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
})

// GET /api/admin/analytics/sales-chart
app.get('/api/admin/analytics/sales-chart', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailySales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    res.json(salesData)
  } catch (err) {
    console.error('Sales chart error:', err)
    res.status(500).json({ error: 'Failed to fetch sales chart data' })
  }
})

// GET /api/admin/analytics/top-products
app.get('/api/admin/analytics/top-products', adminAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const topProducts = await Product.find()
      .sort({ popularity: -1 })
      .limit(parseInt(limit))
      .select('title price popularity image category')

    res.json(topProducts)
  } catch (err) {
    console.error('Top products error:', err)
    res.status(500).json({ error: 'Failed to fetch top products' })
  }
})

// OTP request endpoint (example: /api/auth/request-otp)
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body
  if (!email) {
    console.error('OTP request: No email provided')
    return res.status(400).json({ error: 'Email required' })
  }
  try {
    let user
    try {
      user = await User.findOne({ email })
    } catch (err) {
      console.error('OTP request: Error finding user:', err)
      return res.status(500).json({ error: 'Database error (find user)' })
    }

    if (!user) {
      try {
        user = await User.create({ email, password: 'temp' })
      } catch (err) {
        console.error('OTP request: Error creating user:', err)
        return res.status(500).json({ error: 'Database error (create user)' })
      }
    }

    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    user.otpRequests = (user.otpRequests || []).filter(ts => ts > oneMinuteAgo)
    if (user.otpRequests.length >= 3) {
      console.warn('OTP request: Rate limit exceeded for', email)
      return res.status(429).json({ error: 'Too many OTP requests. Please wait a minute.' })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.otp = otp
    user.otpExpires = new Date(now.getTime() + 10 * 60 * 1000) // 10 min expiry
    user.otpRequests.push(now)

    try {
      await user.save()
    } catch (err) {
      console.error('OTP request: Error saving user:', err)
      return res.status(500).json({ error: 'Database error (save user)' })
    }

    // Send OTP email
    try {
      const emailHtml = createOTPEmailTemplate(otp, user.email)
      await transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || 'kuchbhilelo`07@gmail.com',
        to: user.email,
        subject: 'Your Verification Code - Celestial Gems',
        html: emailHtml,
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`
      })
      console.log(`OTP email sent successfully to ${user.email}`)
    } catch (err) {
      console.error('OTP request: Error sending email:', err)
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('OTP request: Unknown error:', err)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// OTP verification endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' })
  try {
    const user = await User.findOne({ email })
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ error: 'No OTP found for this user' })
    }
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' })
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expired' })
    }
    user.isVerified = true
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()
    
    // Clean up temporary users that are older than 1 hour and haven't been verified
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    await User.deleteMany({
      password: 'temp',
      isVerified: { $ne: true },
      createdAt: { $lt: oneHourAgo }
    })
    
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed' })
  }
})

app.post('/api/test', (req, res) => {
  console.log('Test route hit:', req.body)
  res.json({ ok: true })
})

app.get('/api/consultations/:id', authenticateJWT, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' })
    if (consultation.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    res.json(consultation)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultation' })
  }
})

// DELETE /api/consultations/:id (user can cancel only if 12+ hours before slot)
app.delete('/api/consultations/:id', authenticateJWT, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' })
    }
    if (consultation.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    // Calculate slot datetime from date and slot
    function parseSlotTo24Hour(slot) {
      const [time, modifier] = slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return { hours, minutes }
    }
    const { hours, minutes } = parseSlotTo24Hour(consultation.slot)
    const slotDateTime = new Date(consultation.date)
    slotDateTime.setHours(hours, minutes, 0, 0)
    const now = new Date()
    const diffMs = slotDateTime - now
    const diffHours = diffMs / (1000 * 60 * 60)
    if (diffHours < 12) {
      return res.status(400).json({ error: 'You can only cancel a booking at least 12 hours before the meeting time.' })
    }
    await Consultation.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel consultation' })
  }
})

// Upload endpoint (single or multiple)
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  const fileUrls = req.files.map(file => `/uploads/${file.filename}`)
  res.json({ urls: fileUrls })
})

// --- PhonePe Payment Endpoints ---

// Helper function to generate PhonePe checksum
function generatePhonePeChecksum(payload) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const string = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY
  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  return sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX
}

// Helper function to verify PhonePe checksum
function verifyPhonePeChecksum(payload, checksum) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const string = base64Payload + '/pg/v1/status' + PHONEPE_CONFIG.SALT_KEY
  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  const expectedChecksum = sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX
  return checksum === expectedChecksum
}

// POST /api/payment/phonepe/create
app.post('/api/payment/phonepe/create', authenticateJWT, async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, customerInfo } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    // Create PhonePe payment payload
    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: req.user.userId,
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${req.protocol}://${req.get('host')}/payment-status`,
      redirectMode: 'POST',
      callbackUrl: `${req.protocol}://${req.get('host')}/api/payment/phonepe/callback`,
      mobileNumber: customerInfo?.phone || '',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    }

    // Generate checksum
    const checksum = generatePhonePeChecksum(payload)
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')

    // Make request to PhonePe
    const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({
        request: base64Payload
      })
    })

    const data = await response.json()

    if (data.code === 'SUCCESS') {
      res.json({
        success: true,
        redirectUrl: data.data.instrumentResponse.redirectInfo.url,
        transactionId: data.data.merchantTransactionId
      })
    } else {
      throw new Error(data.message || 'PhonePe payment creation failed')
    }
  } catch (err) {
    console.error('PhonePe payment creation failed:', err)
    res.status(500).json({ error: 'Failed to create PhonePe payment' })
  }
})

// POST /api/payment/phonepe/callback
app.post('/api/payment/phonepe/callback', async (req, res) => {
  try {
    const { merchantTransactionId, transactionId, amount, merchantId, transactionStatus, responseCode, checksum } = req.body

    // Verify checksum
    const payload = {
      merchantId,
      merchantTransactionId,
      transactionId,
      amount,
      merchantUserId: req.body.merchantUserId,
      transactionStatus,
      responseCode
    }

    if (!verifyPhonePeChecksum(payload, checksum)) {
      console.error('PhonePe callback: Invalid checksum')
      return res.status(400).json({ error: 'Invalid checksum' })
    }

    // Update order status based on transaction status
    if (transactionStatus === 'PAYMENT_SUCCESS') {
      // Find and update order
      const order = await Order.findOne({ _id: merchantTransactionId })
      if (order) {
        order.status = 'Paid'
        order.paymentIntentId = transactionId
        await order.save()

        // Clear user's cart
        const user = await User.findById(order.userId)
        if (user) {
          user.cart = []
          await user.save()
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('PhonePe callback error:', err)
    res.status(500).json({ error: 'Callback processing failed' })
  }
})

// POST /api/payment/phonepe/status
app.post('/api/payment/phonepe/status', authenticateJWT, async (req, res) => {
  try {
    const { merchantTransactionId } = req.body

    if (!merchantTransactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' })
    }

    // Check payment status with PhonePe
    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId
    }

    const checksum = generatePhonePeChecksum(payload)
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')

    const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID
      }
    })

    const data = await response.json()

    if (data.code === 'SUCCESS') {
      const paymentInfo = data.data
      
      // Update order if payment is successful
      if (paymentInfo.paymentInstrument.paymentStatus === 'SUCCESS') {
        const order = await Order.findById(merchantTransactionId)
        if (order && order.status !== 'Paid') {
          order.status = 'Paid'
          order.paymentIntentId = paymentInfo.transactionId
          await order.save()

          // Clear user's cart
          const user = await User.findById(req.user.userId)
          if (user) {
            user.cart = []
            await user.save()
          }
        }
      }

      res.json({
        success: true,
        status: paymentInfo.paymentInstrument.paymentStatus,
        transactionId: paymentInfo.transactionId,
        amount: paymentInfo.amount / 100 // Convert from paise to rupees
      })
    } else {
      throw new Error(data.message || 'Failed to check payment status')
    }
  } catch (err) {
    console.error('PhonePe status check failed:', err)
    res.status(500).json({ error: 'Failed to check payment status' })
  }
})

// Serve React build static files
app.use(express.static(path.join(__dirname, '../client/build')))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')))

// --- All API routes should be above this line ---

// Catch-all: serve React for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  } else {
    res.status(404).json({ error: 'API route not found' })
  }
})

app.listen(5000, () => console.log('Server running on http://localhost:5000')) 

// One-time cleanup of existing temporary users on server start
setTimeout(async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const result = await User.deleteMany({
      password: 'temp',
      isVerified: { $ne: true },
      createdAt: { $lt: oneHourAgo }
    })
    if (result.deletedCount > 0) {
      console.log(`Initial cleanup: Removed ${result.deletedCount} old temporary users`)
    }
  } catch (err) {
    console.error('Error during initial temporary user cleanup:', err)
  }
}, 5000) // Run 5 seconds after server starts

// Periodic cleanup of temporary users (runs every hour)
setInterval(async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const result = await User.deleteMany({
      password: 'temp',
      isVerified: { $ne: true },
      createdAt: { $lt: oneHourAgo }
    })
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} temporary users`)
    }
  } catch (err) {
    console.error('Error during temporary user cleanup:', err)
  }
}, 60 * 60 * 1000) // Run every hour

// Helper function to create beautiful OTP email template
function createOTPEmailTemplate(otp, email) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code - Celestial Gems</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #003D37 0%, #005a52 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .otp-container {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #003D37;
                border-radius: 15px;
                padding: 30px;
                margin: 30px 0;
                display: inline-block;
            }
            .otp-code {
                font-size: 48px;
                font-weight: bold;
                color: #003D37;
                letter-spacing: 8px;
                margin: 0;
                font-family: 'Courier New', monospace;
            }
            .otp-label {
                color: #6c757d;
                font-size: 14px;
                margin: 10px 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .info-text {
                color: #495057;
                font-size: 16px;
                line-height: 1.6;
                margin: 20px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            .footer p {
                margin: 0;
                color: #6c757d;
                font-size: 12px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .expiry {
                color: #dc3545;
                font-weight: 600;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✨ Celestial Gems</div>
                <h1>Your Verification Code</h1>
                <p>Complete your registration with the code below</p>
            </div>
            
            <div class="content">
                <p class="info-text">
                    Hello! You've requested a verification code for your Celestial Gems account. 
                    Use the code below to complete your registration:
                </p>
                
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-label">Verification Code</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    • This code will expire in 10 minutes<br>
                    • Never share this code with anyone<br>
                    • If you didn't request this code, please ignore this email
                </div>
                
                <p class="info-text">
                    Enter this code in the registration form to verify your email address 
                    and complete your account setup.
                </p>
                
                <p class="expiry">
                    ⏰ Code expires in 10 minutes
                </p>
            </div>
            
            <div class="footer">
                <p>
                    This email was sent to <strong>${email}</strong><br>
                    If you have any questions, please contact our support team.<br>
                    © 2024 Celestial Gems. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
} 
import Stripe from 'stripe'
import fetch from 'node-fetch'
import multer from 'multer'
import fs from 'fs'
import crypto from 'crypto'
import 'dotenv/config'

const app = express()
app.use(cors({
  origin: [
    'http://localhost:3000', // For local development
    'https://kushal-15gt.onrender.com' // Your Render production domain
  ],
  credentials: true
}))
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here' // Use env var in production

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here', {
  apiVersion: '2023-10-16'
})

// PhonePe Configuration
const PHONEPE_CONFIG = {
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || 'your_phonepe_merchant_id_here',
  SALT_KEY: process.env.PHONEPE_SALT_KEY || 'your_phonepe_salt_key_here',
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX || 'your_phonepe_salt_index_here',
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/hermes'
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://samarthsalgar02:jDD9idZrfTLC9Y6u@cluster0.b24xtrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  birthDate: { type: Date },
  zodiacSign: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  notificationPreferences: {
    promotions: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true }
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      price: String,
      image: String,
      quantity: { type: Number, default: 1 }
    }
  ],
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date,
  otpRequests: { type: [Date], default: [] },
  isVerified: { type: Boolean, default: false }
})
const User = mongoose.model('User', userSchema)

// Product model
const productSchema = new mongoose.Schema({
  image: String,
  title: String,
  description: String,
  price: String,
  originalPrice: String,
  category: String,
  material: String,
  style: String,
  popularity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  specs: [String] // <-- Add this line for specifications
})
const Product = mongoose.model('Product', productSchema)

// Review model
const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})
const Review = mongoose.model('Review', reviewSchema)

// Order model
const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' }, // Can be 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  createdAt: { type: Date, default: Date.now },
  paymentIntentId: String
})
const Order = mongoose.model('Order', orderSchema)

// Consultation model
const consultationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  phone: String,
  dob: String,
  tob: String,
  pob: String,
  package: String,
  date: String, // YYYY-MM-DD
  slot: String, // e.g., '09:00 AM'
  questions: String,
  roomUrl: String, // Whereby room link
  createdAt: { type: Date, default: Date.now },
  accessTime: Date
})
const Consultation = mongoose.model('Consultation', consultationSchema)

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key_here'
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'your_sendgrid_from_email_here'

console.log('SENDGRID_API_KEY:', SENDGRID_API_KEY ? SENDGRID_API_KEY.slice(0,8) + '...' : 'NOT SET') // Remove after testing

// Configure nodemailer for SendGrid
// 1. Set SENDGRID_API_KEY in your environment variables
// 2. Use 'apikey' as the user and your actual API key as the pass
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'apikey', // This is literally the string 'apikey', not your username
    pass: SENDGRID_API_KEY
  }
})

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, '../client/public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage })

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    console.log(`Registration attempt for email: ${email}`)
    const existing = await User.findOne({ email })
    if (existing) {
      console.log(`User exists with email: ${email}, password: ${existing.password}, isVerified: ${existing.isVerified}`)
      // Check if this is a temporary user created during OTP request
      if (existing.password === 'temp' && existing.isVerified) {
        console.log(`Updating temporary user for email: ${email}`)
        // Update the temporary user with real password
        const hash = await bcrypt.hash(password, 10)
        existing.password = hash
        if (name) existing.name = name
        await existing.save()
        console.log(`Successfully updated temporary user for email: ${email}`)
        res.json({ success: true, user: { email: existing.email } })
      } else {
        console.log(`Real user already exists for email: ${email}`)
        // Real user already exists
        return res.status(409).json({ error: 'Email already registered' })
      }
    } else {
      console.log(`Creating new user for email: ${email}`)
      // Create new user
      const hash = await bcrypt.hash(password, 10)
      const user = await User.create({ email, password: hash, name })
      console.log(`Successfully created new user for email: ${email}`)
      res.json({ success: true, user: { email: user.email } })
    }
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    console.log(`Login attempt for email: ${email}`)
    const user = await User.findOne({ email })
    if (!user) {
      console.log(`No user found for email: ${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    console.log(`User found for email: ${email}, password type: ${user.password === 'temp' ? 'temp' : 'hashed'}`)
    
    // Prevent login for temporary users that haven't been properly registered
    if (user.password === 'temp') {
      console.log(`Login blocked for temporary user: ${email}`)
      return res.status(401).json({ error: 'Please complete your registration first' })
    }
    
    const match = await bcrypt.compare(password, user.password)
    console.log(`Password match for ${email}: ${match}`)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    console.log(`Login successful for email: ${email}`)
    res.json({ success: true, token, user: { email: user.email } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Admin login endpoint
const ADMIN_CODE = process.env.ADMIN_CODE || 'superadmincode' // Set in env in production

app.post('/api/admin/login', async (req, res) => {
  const { email, password, adminCode } = req.body
  if (!email || !password || !adminCode) return res.status(400).json({ error: 'Email, password, and admin code required' })
  try {
    const user = await User.findOne({ email })
    if (!user || !user.isAdmin) return res.status(401).json({ error: 'Not authorized as admin' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    if (adminCode !== ADMIN_CODE) return res.status(401).json({ error: 'Invalid admin code' })
    const token = jwt.sign({ userId: user._id, email: user.email, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token, user: { email: user.email, isAdmin: true } })
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed' })
  }
})

function authenticateJWT (req, res, next) {
  const authHeader = req.headers.authorization
  // console.log('Authorization header:', authHeader)
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log('JWT verification error:', err)
        return res.sendStatus(403) // Forbidden
      }
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401) // Unauthorized
  }
}

// Mock data
const gemstones = [
  { _id: '60f7c0b8e1d3f8a1b1a1a1a1', name: 'Ruby', sign: 'Mars Signs', price: '$1,299', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a2', name: 'Sapphire', sign: 'Mercury Signs', price: '$999', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a3', name: 'Emerald', sign: 'Venus Signs', price: '$1,499', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a4', name: 'Amethyst', sign: 'Jupiter Signs', price: '$899', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a5', name: 'Diamond', sign: 'Sun Signs', price: '$2,499', image: '' },
  { _id: '60f7c0b8e1d3f8a1b1a1a1a6', name: 'Topaz', sign: 'Saturn Signs', price: '$799', image: '' }
]

const services = [
  { title: 'Personal Gemstone Reading', duration: '60 minutes', price: '$199', icon: '', description: 'Discover which gemstones align with your unique astrological profile. Receive tailored recommendations to enhance your well-being and success.' },
  { title: 'Birth Chart Analysis', duration: '90 minutes', price: '$299', icon: '', description: 'Uncover the secrets of your natal chart and planetary influences. Gain deep insights into your strengths, challenges, and life path.' },
  { title: 'Crystal Healing Session', duration: '45 minutes', price: '$149', icon: '', description: 'Experience the restorative power of crystals chosen for your energy. Learn how to use them for balance, healing, and personal growth.' }
]

// Blog model
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  readTime: { type: String, required: true },
  summary: { type: String },
  content: { type: String, required: true }, // For now, plain string. Can be blocks/rich text later.
  tags: [String],
  image: String,
  images: [String], // Array of image URLs for blog content
  relatedProducts: [String] // Array of product IDs or names
})
const Blog = mongoose.model('Blog', blogSchema)

// Update /api/insights to return latest 3 blogs
app.get('/api/insights', async (req, res) => {
  try {
    const insights = await Blog.find().sort({ date: -1 }).limit(3)
    res.json(insights)
  } catch (err) {
    console.error('Error in /api/insights:', err)
    res.status(500).json({ error: 'Failed to fetch insights' })
  }
})

// GET /api/products with pagination and sorting
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8
    const sortBy = req.query.sortBy || 'title'
    const order = req.query.order === 'desc' ? -1 : 1
    const search = req.query.search || ''
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : null
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null

    const skip = (page - 1) * limit
    const sortObj = { [sortBy]: order }

    let filter = {}
    if (search) {
      filter.$text = { $search: search }
    }
    if (minPrice !== null || maxPrice !== null) {
      filter.$expr = { $and: [] }
      if (minPrice !== null) {
        filter.$expr.$and.push({ $gte: [ { $toInt: { $replaceAll: { input: "$price", find: /[^0-9]/g, replacement: "" } } }, minPrice ] })
      }
      if (maxPrice !== null) {
        filter.$expr.$and.push({ $lte: [ { $toInt: { $replaceAll: { input: "$price", find: /[^0-9]/g, replacement: "" } } }, maxPrice ] })
      }
      if (!filter.$expr.$and.length) delete filter.$expr
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ])

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Seed endpoint for mock products (one-time use)
app.post('/api/products/seed', async (req, res) => {
  const mockProducts = [
    {
      image: 'https://via.placeholder.com/100x100?text=Ring',
      title: 'Diamond Solitaire Ring',
      description: 'A classic diamond ring for every occasion.',
      price: '$2499',
      category: 'Rings',
      material: 'Gold',
      style: 'Classic'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Earring',
      title: 'Pearl Drop Earrings',
      description: 'Elegant pearl earrings for a timeless look.',
      price: '$899',
      category: 'Earrings',
      material: 'Silver',
      style: 'Modern'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Necklace',
      title: 'Gold Chain Necklace',
      description: 'Handcrafted gold necklace with intricate design.',
      price: '$2899',
      category: 'Necklaces',
      material: 'Gold',
      style: 'Vintage'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Bracelet',
      title: 'Sapphire Tennis Bracelet',
      description: 'A stunning bracelet with blue sapphires.',
      price: '$1800',
      category: 'Bracelets',
      material: 'Platinum',
      style: 'Contemporary'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Necklace',
      title: 'Ruby Pendant',
      description: 'A beautiful ruby pendant for special moments.',
      price: '$1599',
      category: 'Necklaces',
      material: 'Gold',
      style: 'Classic'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Earring',
      title: 'Diamond Stud Earrings',
      description: 'Sparkling diamond studs for everyday wear.',
      price: '$1000',
      category: 'Earrings',
      material: 'Silver',
      style: 'Modern'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Ring',
      title: 'Emerald Ring',
      description: 'A vibrant emerald ring for a pop of color.',
      price: '$2850',
      category: 'Rings',
      material: 'Gold',
      style: 'Vintage'
    },
    {
      image: 'https://via.placeholder.com/100x100?text=Bracelet',
      title: 'Gold Bangle',
      description: 'A classic gold bangle for every wrist.',
      price: '$799',
      category: 'Bracelets',
      material: 'Gold',
      style: 'Classic'
    }
  ]
  try {
    await Product.deleteMany({})
    const inserted = await Product.insertMany(mockProducts)
    res.json({ success: true, count: inserted.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed products' })
  }
})

app.get('/api/gemstones', (req, res) => res.json(gemstones))
app.get('/api/services', (req, res) => res.json(services))

// POST /api/products (admin)
app.post('/api/products', adminAuth, async (req, res) => {
  try {
    const { price, originalPrice } = req.body
    if (!price || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Discounted price is required and must be a number' })
    }
    if (originalPrice && isNaN(Number(originalPrice))) {
      return res.status(400).json({ error: 'Original price must be a number' })
    }
    req.body.price = String(price)
    if (originalPrice) req.body.originalPrice = String(originalPrice)
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' })
  }
})

// PUT /api/products/:id (admin)
app.put('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const { price, originalPrice } = req.body
    if (!price || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Discounted price is required and must be a number' })
    }
    if (originalPrice && isNaN(Number(originalPrice))) {
      return res.status(400).json({ error: 'Original price must be a number' })
    }
    req.body.price = String(price)
    if (originalPrice) req.body.originalPrice = String(originalPrice)
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/products/:id (admin)
app.delete('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.post('/api/newsletter', (req, res) => {
  // For now, just return success
  res.json({ success: true })
})

// GET /api/products/recommendations?exclude=1,2,3
app.get('/api/products/recommendations', async (req, res) => {
  try {
    const excludeIds = (req.query.exclude || '').split(',').filter(Boolean)
    const filter = excludeIds.length ? { _id: { $nin: excludeIds } } : {}
    const count = await Product.countDocuments(filter)
    const randomSkip = count > 4 ? Math.floor(Math.random() * (count - 4 + 1)) : 0
    const recommendations = await Product.find(filter).skip(randomSkip).limit(4)
    res.json(recommendations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// In-memory reviews store (mock, resets on server restart)
const productReviews = {}

// GET /api/products/:id/reviews (mock)
app.get('/api/products/:id/reviews', (req, res) => {
  const id = req.params.id
  if (!productReviews[id]) {
    productReviews[id] = [
      { user: 'Amit S.', rating: 5, comment: 'Absolutely stunning timepiece. Worth every penny!' },
      { user: 'Priya K.', rating: 4, comment: 'Beautiful craftsmanship and fast shipping.' }
    ]
  }
  res.json(productReviews[id])
})

// POST /api/products/:id/reviews (mock)
app.post('/api/products/:id/reviews', (req, res) => {
  const id = req.params.id
  const { user, rating, comment } = req.body
  if (!user || !rating || !comment) return res.status(400).json({ error: 'All fields required' })
  if (!productReviews[id]) productReviews[id] = []
  productReviews[id].unshift({ user, rating, comment })
  res.json(productReviews[id])
})

// POST /api/orders - create a new order (protected)
app.post('/api/orders', authenticateJWT, async (req, res) => {
  const { email, phone, name, address, city, zip, country, items, subtotal, shipping, tax, total } = req.body
  if (!email || !phone || !name || !address || !city || !zip || !country || !items || !subtotal || !total) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const order = await Order.create({
      email, phone, name, address, city, zip, country, items, subtotal, shipping, tax, total
    })
    
    // Increment popularity for each product in the order
    const productIds = items.map(item => item.productId || item._id).filter(Boolean)
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { popularity: 1 } }
      )
    }
    
    res.json({ success: true, orderId: order._id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' })
  }
})

// GET /api/consultations/slots?date=YYYY-MM-DD
app.get('/api/consultations/slots', async (req, res) => {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Date is required' })
  const allSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM'
  ]
  try {
    const bookings = await Consultation.find({ date })
    const bookedSlots = bookings.map(b => b.slot)
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot))
    res.json({ availableSlots })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

// Settings model for global flags
const settingsSchema = new mongoose.Schema({
  isConsultationBlocked: { type: Boolean, default: false },
  consultationBlockedUntil: { type: Date, default: null }
})
const Settings = mongoose.model('Settings', settingsSchema)

// Helper to get or create settings doc
async function getSettings() {
  let settings = await Settings.findOne()
  if (!settings) settings = await Settings.create({})
  return settings
}

// GET /api/settings/consultation-blocked
app.get('/api/settings/consultation-blocked', async (req, res) => {
  try {
    const settings = await getSettings()
    res.json({
      isConsultationBlocked: settings.isConsultationBlocked,
      consultationBlockedUntil: settings.consultationBlockedUntil
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// PUT /api/settings/consultation-blocked (admin only)
app.put('/api/settings/consultation-blocked', adminAuth, async (req, res) => {
  try {
    const { isConsultationBlocked, consultationBlockedUntil } = req.body
    const settings = await getSettings()
    if (typeof isConsultationBlocked !== 'undefined') {
      settings.isConsultationBlocked = !!isConsultationBlocked
    }
    if (typeof consultationBlockedUntil !== 'undefined') {
      settings.consultationBlockedUntil = consultationBlockedUntil ? new Date(consultationBlockedUntil) : null
    }
    await settings.save()
    res.json({
      isConsultationBlocked: settings.isConsultationBlocked,
      consultationBlockedUntil: settings.consultationBlockedUntil
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// POST /api/consultations (JWT protected, prevents double-booking)
app.post('/api/consultations', authenticateJWT, async (req, res) => {
  // Block booking if admin has set the flag
  const settings = await getSettings()
  if (settings.isConsultationBlocked) {
    return res.status(423).json({ error: 'Consultations are temporarily unavailable. Please try again later.' })
  }
  // Block booking if requested date is in blackout period
  if (settings.consultationBlockedUntil) {
    const reqDate = new Date(req.body.date)
    if (reqDate <= settings.consultationBlockedUntil) {
      return res.status(423).json({ error: `Consultations are unavailable until ${settings.consultationBlockedUntil.toLocaleDateString()}. Please select a later date.` })
    }
  }
  console.log('Consultation payload:', req.body)
  const { dob, tob, pob, package: pkg, date, slot, questions } = req.body
  if (!dob || !tob || !pob || !pkg || !date || !slot) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    // Fetch user info from DB
    const user = await User.findById(req.user.userId)
    console.log('Fetched user:', user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const name = user.name
    const email = user.email
    // Prevent double-booking
    const exists = await Consultation.findOne({ date, slot })
    if (exists) return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' })

    // Use a static Whereby room URL for all consultations
    const roomUrl = 'https://whereby.com/kaivaylya-aastrology' // <-- Replace with your actual room name

    // Calculate when the room should be accessible (5 minutes before slot)
    function parseSlotTo24Hour(slot) {
      // slot: "09:00 AM" or "05:00 PM"
      const [time, modifier] = slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return { hours, minutes }
    }

    const { hours, minutes } = parseSlotTo24Hour(slot)
    const slotDateTime = new Date(date)
    slotDateTime.setHours(hours, minutes, 0, 0)
    const accessTime = new Date(slotDateTime.getTime() - 5 * 60000)

    const consultation = await Consultation.create({
      userId: req.user.userId,
      name, email, dob, tob, pob, package: pkg, date, slot, questions, roomUrl, accessTime
    })

    console.log('Before sending email')
    const mailOptions = {
      from: process.env.GMAIL_USER || 'kuchbhilelo107@gmail.com',
      to: email,
      subject: 'Your Consultation Booking is Confirmed',
      html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border-radius:12px;background:#faf9fb;border:1px solid #eee;">
        <h2 style="color:#D4AF37;">Thank you for booking your consultation!</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>Your consultation is confirmed with the following details:</p>
        <ul>
          <li><b>Package:</b> ${pkg}</li>
          <li><b>Date:</b> ${date}</li>
          <li><b>Time:</b> ${slot}</li>
          <li><b>Join Call:</b> <a href="${roomUrl}">${roomUrl}</a></li>
        </ul>
        <p>We look forward to guiding you on your journey.<br/>If you have any questions, reply to this email.</p>
        <p style="color:#888;font-size:13px;margin-top:24px;">Celestial Gems Team</p>
      </div>`
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email send error:', err)
      } else {
        console.log('Email sent:', info)
      }
    })
    console.log('After sending email (async)')
    res.json({ success: true, consultationId: consultation._id, roomUrl })
  } catch (err) {
    console.error('General error in /api/consultations:', err)
    res.status(500).json({ error: 'Failed to book consultation' })
  }
})

// GET /api/blogs (list, with pagination, search, filter, sort)
app.get('/api/blogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8
    const search = req.query.search || ''
    const tag = req.query.tag || ''
    const sortBy = req.query.sortBy || 'date'
    const order = req.query.order === 'asc' ? 1 : -1
    const skip = (page - 1) * limit
    const filter = {}
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    if (tag) {
      filter.tags = tag
    }
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ [sortBy]: order }).skip(skip).limit(limit),
      Blog.countDocuments(filter)
    ])
    res.json({ blogs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Error in /api/blogs:', err)
    res.status(500).json({ error: 'Failed to fetch blogs' })
  }
})

// GET /api/blogs/:id (get single blog)
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog' })
  }
})

// POST /api/blogs (create blog)
app.post('/api/blogs', async (req, res) => {
  try {
    const { title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts } = req.body
    const blog = await Blog.create({ title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' })
  }
})

// PUT /api/blogs/:id (update blog)
app.put('/api/blogs/:id', async (req, res) => {
  try {
    const { title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts } = req.body
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, slug, author, date, readTime, summary, content, tags, image, images, relatedProducts },
      { new: true }
    )
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' })
  }
})

// DELETE /api/blogs/:id (delete blog)
app.delete('/api/blogs/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' })
  }
})

// Admin auth middleware
function adminAuth (req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ error: 'No token provided' })
  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Admin access required' })
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

app.put('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { name, phone, birthDate, zodiacSign, location } = req.body
    user.name = name || user.name
    user.phone = phone || user.phone
    user.birthDate = birthDate || user.birthDate
    user.zodiacSign = zodiacSign || user.zodiacSign
    user.location = location || user.location

    const updatedUser = await user.save()
    const userResponse = updatedUser.toObject()
    delete userResponse.password

    res.json(userResponse)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user profile' })
  }
})

// --- User-facing ---
// GET /api/my-orders (user)
app.get('/api/my-orders', authenticateJWT, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// --- Admin Order Management ---
// GET /api/orders (admin)
app.get('/api/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// PUT /api/orders/:id/status (admin)
app.put('/api/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// DELETE /api/orders/:id (admin)
app.delete('/api/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ success: true, message: 'Order deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' })
  }
})

// GET /api/consultations/all (admin)
app.get('/api/consultations/all', adminAuth, async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ date: -1 })
    res.json({ consultations })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' })
  }
})

app.get('/api/consultations', authenticateJWT, async (req, res) => {
  try {
    const consultations = await Consultation.find({ userId: req.user.userId }).sort({ date: -1 })
    res.json(consultations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' })
  }
})

app.post('/api/account/change-password', authenticateJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const { userId } = req.user

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' })
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' })
  }
})

app.put('/api/account/notification-preferences', authenticateJWT, async (req, res) => {
  const { preferences } = req.body
  const { userId } = req.user

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationPreferences: preferences } },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification preferences' })
  }
})

app.delete('/api/account/delete', authenticateJWT, async (req, res) => {
  const { password } = req.body
  const { userId } = req.user

  if (!password) {
    return res.status(400).json({ error: 'Password is required to delete account' })
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    // Optional: Handle deletion of associated data (e.g., orders, consultations) here
    // For now, we will just delete the user.

    await User.findByIdAndDelete(userId)

    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

// --- Admin User Management ---
// GET /api/users (admin)
app.get('/api/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// PUT /api/users/:id/block (admin)
app.put('/api/users/:id/block', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'User blocked' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user' })
  }
})

// PUT /api/users/:id/unblock (admin)
app.put('/api/users/:id/unblock', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'User unblocked' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock user' })
  }
})

// DELETE /api/users/:id (admin)
app.delete('/api/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// --- Shopping Cart Endpoints ---
// GET /api/cart (get current user's cart)
app.get('/api/cart', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ cart: user.cart || [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// POST /api/cart/add (add item to cart)
app.post('/api/cart/add', authenticateJWT, async (req, res) => {
  const { productId, title, price, image, quantity } = req.body
  if (!productId || !title || !price) {
    return res.status(400).json({ error: 'Missing product info' })
  }
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const existing = user.cart.find(item => item.productId.toString() === productId)
    if (existing) {
      existing.quantity += quantity || 1
    } else {
      user.cart.push({ productId, title, price, image: image || '', quantity: quantity || 1 })
    }
    await user.save()
    res.json({ cart: user.cart })
  } catch (err) {
    console.error('Failed to add to cart:', err)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// POST /api/cart/remove (remove item from cart)
app.post('/api/cart/remove', authenticateJWT, async (req, res) => {
  const { productId } = req.body
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.cart = user.cart.filter(item => item.productId.toString() !== productId)
    await user.save()
    res.json({ cart: user.cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
})

// POST /api/cart/update (update quantity)
app.post('/api/cart/update', authenticateJWT, async (req, res) => {
  const { productId, quantity } = req.body
  if (!productId || typeof quantity !== 'number') return res.status(400).json({ error: 'Missing productId or quantity' })
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const item = user.cart.find(i => i.productId.toString() === productId)
    if (!item) return res.status(404).json({ error: 'Item not found in cart' })
    item.quantity = quantity
    await user.save()
    res.json({ cart: user.cart })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// POST /api/cart/clear (clear cart)
app.post('/api/cart/clear', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.cart = []
    await user.save()
    res.json({ cart: [] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

// POST /api/checkout (create order from cart and clear cart)
app.post('/api/checkout', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!user.cart || user.cart.length === 0) return res.status(400).json({ error: 'Cart is empty' })

    // Calculate totals (assume price is a string like "$1299" or "$1,299")
    let subtotal = 0
    user.cart.forEach(item => {
      const priceNum = Number(String(item.price).replace(/[^\d.]/g, ''))
      subtotal += priceNum * (item.quantity || 1)
    })
    const shipping = 100 // Flat shipping for now
    const tax = Math.round(subtotal * 0.1)
    const total = subtotal + shipping + tax

    // Create order
    const order = await Order.create({
      email: user.email,
      phone: user.phone || '',
      name: user.name || '',
      address: req.body.address || '',
      city: req.body.city || '',
      zip: req.body.zip || '',
      country: req.body.country || '',
      items: user.cart,
      subtotal,
      shipping,
      tax,
      total
    })

    // Clear cart
    user.cart = []
    await user.save()

    res.json({ success: true, orderId: order._id })
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed' })
  }
})

// --- Stripe Payment Endpoints ---
// POST /api/payment/create-payment-intent
app.post('/api/payment/create-payment-intent', authenticateJWT, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.userId
      }
    })

    res.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (err) {
    console.error('Payment intent creation failed:', err)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

// POST /api/payment/confirm-payment
app.post('/api/payment/confirm-payment', authenticateJWT, async (req, res) => {
  try {
    const { paymentIntentId, orderDetails } = req.body
    
    if (!paymentIntentId || !orderDetails) {
      return res.status(400).json({ error: 'Missing payment or order details' })
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    // Create order in database
    const order = await Order.create({
      ...orderDetails,
      paymentIntentId,
      status: 'Paid'
    })

    // Clear user's cart
    const user = await User.findById(req.user.userId)
    if (user) {
      user.cart = []
      await user.save()
    }

    res.json({ 
      success: true, 
      orderId: order._id,
      message: 'Payment successful and order created'
    })
  } catch (err) {
    console.error('Payment confirmation failed:', err)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

// POST /api/payment/webhook (for handling Stripe webhooks)
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret'

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log('Payment succeeded:', paymentIntent.id)
      // You can add additional logic here like sending confirmation emails
      break
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      console.log('Payment failed:', failedPayment.id)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })
  
  try {
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' })
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })
    
    // Save token to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    // Send reset email
    const resetUrl = `https://kushal-15gt.onrender.com/reset-password?token=${resetToken}`
    const mailOptions = {
      from: process.env.GMAIL_USER || 'kuchbhilelo107@gmail.com',
      to: email,
      subject: 'Password Reset Request - Celestial Gems',
      html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border-radius:12px;background:#faf9fb;border:1px solid #eee;">
        <h2 style="color:#D4AF37;">Password Reset Request</h2>
        <p>Hi <b>${user.name || 'there'}</b>,</p>
        <p>You requested a password reset for your Celestial Gems account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p style="color:#888;font-size:13px;margin-top:24px;">Celestial Gems Team</p>
      </div>`
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Password reset email error:', err)
        return res.status(500).json({ error: 'Failed to send reset email' })
      }
    })

    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' })
  } catch (err) {
    console.error('Password reset error:', err)
    res.status(500).json({ error: 'Failed to process password reset request' })
  }
})

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' })
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Password has been reset successfully' })
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }
    console.error('Password reset error:', err)
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

// --- Admin Analytics Endpoints ---
// GET /api/admin/analytics/dashboard
app.get('/api/admin/analytics/dashboard', adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get total sales in last 30 days
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ])

    // Get new user signups in last 30 days
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isAdmin: { $ne: true }
    })

    // Get most recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email total status createdAt items')

    // Get most popular products
    const popularProducts = await Product.find()
      .sort({ popularity: -1 })
      .limit(10)
      .select('title price popularity image')

    // Get sales trend for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailySales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Get consultation bookings in last 30 days
    const consultationBookings = await Consultation.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    res.json({
      totalSales: salesData[0]?.totalSales || 0,
      orderCount: salesData[0]?.orderCount || 0,
      newUsers,
      recentOrders,
      popularProducts,
      salesTrend,
      consultationBookings
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
})

// GET /api/admin/analytics/sales-chart
app.get('/api/admin/analytics/sales-chart', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailySales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    res.json(salesData)
  } catch (err) {
    console.error('Sales chart error:', err)
    res.status(500).json({ error: 'Failed to fetch sales chart data' })
  }
})

// GET /api/admin/analytics/top-products
app.get('/api/admin/analytics/top-products', adminAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const topProducts = await Product.find()
      .sort({ popularity: -1 })
      .limit(parseInt(limit))
      .select('title price popularity image category')

    res.json(topProducts)
  } catch (err) {
    console.error('Top products error:', err)
    res.status(500).json({ error: 'Failed to fetch top products' })
  }
})

// OTP request endpoint (example: /api/auth/request-otp)
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body
  if (!email) {
    console.error('OTP request: No email provided')
    return res.status(400).json({ error: 'Email required' })
  }
  try {
    let user
    try {
      user = await User.findOne({ email })
    } catch (err) {
      console.error('OTP request: Error finding user:', err)
      return res.status(500).json({ error: 'Database error (find user)' })
    }

    if (!user) {
      try {
        user = await User.create({ email, password: 'temp' })
      } catch (err) {
        console.error('OTP request: Error creating user:', err)
        return res.status(500).json({ error: 'Database error (create user)' })
      }
    }

    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    user.otpRequests = (user.otpRequests || []).filter(ts => ts > oneMinuteAgo)
    if (user.otpRequests.length >= 3) {
      console.warn('OTP request: Rate limit exceeded for', email)
      return res.status(429).json({ error: 'Too many OTP requests. Please wait a minute.' })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.otp = otp
    user.otpExpires = new Date(now.getTime() + 10 * 60 * 1000) // 10 min expiry
    user.otpRequests.push(now)

    try {
      await user.save()
    } catch (err) {
      console.error('OTP request: Error saving user:', err)
      return res.status(500).json({ error: 'Database error (save user)' })
    }

    // Send OTP email
    try {
      const emailHtml = createOTPEmailTemplate(otp, user.email)
      await transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || 'kuchbhilelo`07@gmail.com',
        to: user.email,
        subject: 'Your Verification Code - Celestial Gems',
        html: emailHtml,
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`
      })
      console.log(`OTP email sent successfully to ${user.email}`)
    } catch (err) {
      console.error('OTP request: Error sending email:', err)
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('OTP request: Unknown error:', err)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// OTP verification endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' })
  try {
    const user = await User.findOne({ email })
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ error: 'No OTP found for this user' })
    }
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' })
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expired' })
    }
    user.isVerified = true
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()
    
    // Clean up temporary users that are older than 1 hour and haven't been verified
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    await User.deleteMany({
      password: 'temp',
      isVerified: { $ne: true },
      createdAt: { $lt: oneHourAgo }
    })
    
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed' })
  }
})

app.post('/api/test', (req, res) => {
  console.log('Test route hit:', req.body)
  res.json({ ok: true })
})

app.get('/api/consultations/:id', authenticateJWT, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' })
    if (consultation.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    res.json(consultation)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultation' })
  }
})

// DELETE /api/consultations/:id (user can cancel only if 12+ hours before slot)
app.delete('/api/consultations/:id', authenticateJWT, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' })
    }
    if (consultation.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    // Calculate slot datetime from date and slot
    function parseSlotTo24Hour(slot) {
      const [time, modifier] = slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return { hours, minutes }
    }
    const { hours, minutes } = parseSlotTo24Hour(consultation.slot)
    const slotDateTime = new Date(consultation.date)
    slotDateTime.setHours(hours, minutes, 0, 0)
    const now = new Date()
    const diffMs = slotDateTime - now
    const diffHours = diffMs / (1000 * 60 * 60)
    if (diffHours < 12) {
      return res.status(400).json({ error: 'You can only cancel a booking at least 12 hours before the meeting time.' })
    }
    await Consultation.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel consultation' })
  }
})

// Upload endpoint (single or multiple)
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  const fileUrls = req.files.map(file => `/uploads/${file.filename}`)
  res.json({ urls: fileUrls })
})

// --- PhonePe Payment Endpoints ---

// Helper function to generate PhonePe checksum
function generatePhonePeChecksum(payload) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const string = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY
  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  return sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX
}

// Helper function to verify PhonePe checksum
function verifyPhonePeChecksum(payload, checksum) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const string = base64Payload + '/pg/v1/status' + PHONEPE_CONFIG.SALT_KEY
  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  const expectedChecksum = sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX
  return checksum === expectedChecksum
}

// POST /api/payment/phonepe/create
app.post('/api/payment/phonepe/create', authenticateJWT, async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, customerInfo } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    // Create PhonePe payment payload
    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: req.user.userId,
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${req.protocol}://${req.get('host')}/payment-status`,
      redirectMode: 'POST',
      callbackUrl: `${req.protocol}://${req.get('host')}/api/payment/phonepe/callback`,
      mobileNumber: customerInfo?.phone || '',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    }

    // Generate checksum
    const checksum = generatePhonePeChecksum(payload)
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')

    // Make request to PhonePe
    const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({
        request: base64Payload
      })
    })

    const data = await response.json()

    if (data.code === 'SUCCESS') {
      res.json({
        success: true,
        redirectUrl: data.data.instrumentResponse.redirectInfo.url,
        transactionId: data.data.merchantTransactionId
      })
    } else {
      throw new Error(data.message || 'PhonePe payment creation failed')
    }
  } catch (err) {
    console.error('PhonePe payment creation failed:', err)
    res.status(500).json({ error: 'Failed to create PhonePe payment' })
  }
})

// POST /api/payment/phonepe/callback
app.post('/api/payment/phonepe/callback', async (req, res) => {
  try {
    const { merchantTransactionId, transactionId, amount, merchantId, transactionStatus, responseCode, checksum } = req.body

    // Verify checksum
    const payload = {
      merchantId,
      merchantTransactionId,
      transactionId,
      amount,
      merchantUserId: req.body.merchantUserId,
      transactionStatus,
      responseCode
    }

    if (!verifyPhonePeChecksum(payload, checksum)) {
      console.error('PhonePe callback: Invalid checksum')
      return res.status(400).json({ error: 'Invalid checksum' })
    }

    // Update order status based on transaction status
    if (transactionStatus === 'PAYMENT_SUCCESS') {
      // Find and update order
      const order = await Order.findOne({ _id: merchantTransactionId })
      if (order) {
        order.status = 'Paid'
        order.paymentIntentId = transactionId
        await order.save()

        // Clear user's cart
        const user = await User.findById(order.userId)
        if (user) {
          user.cart = []
          await user.save()
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('PhonePe callback error:', err)
    res.status(500).json({ error: 'Callback processing failed' })
  }
})

// POST /api/payment/phonepe/status
app.post('/api/payment/phonepe/status', authenticateJWT, async (req, res) => {
  try {
    const { merchantTransactionId } = req.body

    if (!merchantTransactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' })
    }

    // Check payment status with PhonePe
    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId
    }

    const checksum = generatePhonePeChecksum(payload)
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')

    const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID
      }
    })

    const data = await response.json()

    if (data.code === 'SUCCESS') {
      const paymentInfo = data.data
      
      // Update order if payment is successful
      if (paymentInfo.paymentInstrument.paymentStatus === 'SUCCESS') {
        const order = await Order.findById(merchantTransactionId)
        if (order && order.status !== 'Paid') {
          order.status = 'Paid'
          order.paymentIntentId = paymentInfo.transactionId
          await order.save()

          // Clear user's cart
          const user = await User.findById(req.user.userId)
          if (user) {
            user.cart = []
            await user.save()
          }
        }
      }

      res.json({
        success: true,
        status: paymentInfo.paymentInstrument.paymentStatus,
        transactionId: paymentInfo.transactionId,
        amount: paymentInfo.amount / 100 // Convert from paise to rupees
      })
    } else {
      throw new Error(data.message || 'Failed to check payment status')
    }
  } catch (err) {
    console.error('PhonePe status check failed:', err)
    res.status(500).json({ error: 'Failed to check payment status' })
  }
})

// Serve React build static files
app.use(express.static(path.join(__dirname, '../client/build')))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')))

// --- All API routes should be above this line ---

// Catch-all: serve React for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  } else {
    res.status(404).json({ error: 'API route not found' })
  }
})

app.listen(5000, () => console.log('Server running on http://localhost:5000')) 

// One-time cleanup of existing temporary users on server start
setTimeout(async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const result = await User.deleteMany({
      password: 'temp',
      isVerified: { $ne: true },
      createdAt: { $lt: oneHourAgo }
    })
    if (result.deletedCount > 0) {
      console.log(`Initial cleanup: Removed ${result.deletedCount} old temporary users`)
    }
  } catch (err) {
    console.error('Error during initial temporary user cleanup:', err)
  }
}, 5000) // Run 5 seconds after server starts

// Periodic cleanup of temporary users (runs every hour)
setInterval(async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const result = await User.deleteMany({
      password: 'temp',
      isVerified: { $ne: true },
      createdAt: { $lt: oneHourAgo }
    })
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} temporary users`)
    }
  } catch (err) {
    console.error('Error during temporary user cleanup:', err)
  }
}, 60 * 60 * 1000) // Run every hour

// Helper function to create beautiful OTP email template
function createOTPEmailTemplate(otp, email) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code - Celestial Gems</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #003D37 0%, #005a52 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .otp-container {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #003D37;
                border-radius: 15px;
                padding: 30px;
                margin: 30px 0;
                display: inline-block;
            }
            .otp-code {
                font-size: 48px;
                font-weight: bold;
                color: #003D37;
                letter-spacing: 8px;
                margin: 0;
                font-family: 'Courier New', monospace;
            }
            .otp-label {
                color: #6c757d;
                font-size: 14px;
                margin: 10px 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .info-text {
                color: #495057;
                font-size: 16px;
                line-height: 1.6;
                margin: 20px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            .footer p {
                margin: 0;
                color: #6c757d;
                font-size: 12px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .expiry {
                color: #dc3545;
                font-weight: 600;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✨ Celestial Gems</div>
                <h1>Your Verification Code</h1>
                <p>Complete your registration with the code below</p>
            </div>
            
            <div class="content">
                <p class="info-text">
                    Hello! You've requested a verification code for your Celestial Gems account. 
                    Use the code below to complete your registration:
                </p>
                
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-label">Verification Code</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    • This code will expire in 10 minutes<br>
                    • Never share this code with anyone<br>
                    • If you didn't request this code, please ignore this email
                </div>
                
                <p class="info-text">
                    Enter this code in the registration form to verify your email address 
                    and complete your account setup.
                </p>
                
                <p class="expiry">
                    ⏰ Code expires in 10 minutes
                </p>
            </div>
            
            <div class="footer">
                <p>
                    This email was sent to <strong>${email}</strong><br>
                    If you have any questions, please contact our support team.<br>
                    © 2024 Celestial Gems. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
} 
