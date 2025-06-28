# PhonePe Payment Integration Setup

This guide explains how to set up PhonePe payment integration alongside Stripe in your Celestial Gems application.

## Environment Variables

Add these environment variables to your server configuration:

```env
# PhonePe Configuration (Test Environment)
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1

# For Production (replace with your actual PhonePe credentials)
# PHONEPE_MERCHANT_ID=your_merchant_id
# PHONEPE_SALT_KEY=your_salt_key
# PHONEPE_SALT_INDEX=your_salt_index
```

## PhonePe Account Setup

1. **Register with PhonePe**: Sign up for a PhonePe Business account at [PhonePe Business](https://business.phonepe.com/)

2. **Get Credentials**: After approval, you'll receive:
   - Merchant ID
   - Salt Key
   - Salt Index

3. **Configure Webhooks**: Set up callback URLs in your PhonePe dashboard:
   - Callback URL: `https://yourdomain.com/api/payment/phonepe/callback`
   - Redirect URL: `https://yourdomain.com/payment-status`

## Features Implemented

### Backend Endpoints

1. **POST /api/payment/phonepe/create**
   - Creates a PhonePe payment request
   - Returns redirect URL for payment

2. **POST /api/payment/phonepe/callback**
   - Handles PhonePe payment callbacks
   - Updates order status automatically

3. **POST /api/payment/phonepe/status**
   - Checks payment status
   - Used for payment verification

### Frontend Components

1. **Payment Method Selection**
   - Users can choose between Stripe and PhonePe
   - Clean UI with payment method cards

2. **Payment Status Page**
   - Handles PhonePe redirects
   - Shows payment success/failure status

## Payment Flow

1. User selects PhonePe as payment method
2. Order is created in pending status
3. PhonePe payment request is created
4. User is redirected to PhonePe payment page
5. After payment, user is redirected back to `/payment-status`
6. Payment status is verified and order is updated
7. User is redirected to order confirmation

## Testing

### Test Credentials
- Use the provided test credentials for development
- Test with small amounts (₹1-₹10)
- PhonePe test environment supports UPI, cards, and wallet payments

### Test Scenarios
1. Successful payment
2. Failed payment
3. Pending payment
4. Network errors
5. Invalid amounts

## Security Features

1. **Checksum Verification**: All PhonePe requests include SHA256 checksums
2. **Request Validation**: Server validates all payment parameters
3. **Order Verification**: Orders are verified before payment processing
4. **Secure Callbacks**: Callback URLs are protected and verified

## Production Deployment

1. **Update Environment Variables**: Replace test credentials with production ones
2. **Update Base URL**: PhonePe will automatically use production URLs
3. **SSL Certificate**: Ensure your domain has valid SSL certificate
4. **Webhook Configuration**: Update callback URLs in PhonePe dashboard
5. **Monitoring**: Set up logging and monitoring for payment transactions

## Troubleshooting

### Common Issues

1. **Invalid Checksum**: Verify salt key and salt index
2. **Payment Not Processing**: Check merchant ID and account status
3. **Callback Failures**: Verify callback URL and server availability
4. **Redirect Issues**: Ensure redirect URL is properly configured

### Debug Steps

1. Check server logs for payment creation errors
2. Verify PhonePe dashboard for transaction status
3. Test with PhonePe's test credentials
4. Check network connectivity to PhonePe APIs

## Support

For PhonePe integration support:
- PhonePe Business Support: [business.phonepe.com/support](https://business.phonepe.com/support)
- API Documentation: [PhonePe API Docs](https://developer.phonepe.com/)

For application-specific issues, check the server logs and verify all environment variables are correctly set. 