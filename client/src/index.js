import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_your_public_key_here')

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Elements stripe={stripePromise}>
    <App />
  </Elements>
)