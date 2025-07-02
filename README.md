# AI Resume Optimizer with Secure Payment System

A professional resume optimization platform powered by AI with a secure Razorpay payment integration and real-time subscription management.

## 🚀 Features

### 🔐 Secure Payment System
- **Backend-First Architecture**: All sensitive operations handled server-side
- **Razorpay Integration**: Secure payment processing with signature verification
- **Real-time Webhooks**: Automatic subscription updates via Razorpay webhooks
- **Environment-Based Configuration**: Separate dev/prod configurations

### 💳 Subscription Management
- **Real-time Database**: Supabase-powered subscription tracking
- **Usage Monitoring**: Track optimization usage in real-time
- **Automatic Expiration**: Smart subscription lifecycle management
- **Payment History**: Complete transaction audit trail

### 🎯 Core Features
- AI-powered resume optimization
- ATS-friendly formatting
- Project portfolio analysis
- PDF/Word export
- Real-time usage tracking
- Subscription management

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Razorpay Configuration (Frontend)
VITE_RAZORPAY_KEY_ID=rzp_live_U7N6E8ot31tiej

# Plan Pricing Configuration
VITE_PLAN_DAILY_PRICE=39
VITE_PLAN_WEEKLY_PRICE=129
VITE_PLAN_MONTHLY_PRICE=349
VITE_PLAN_YEARLY_PRICE=1299

# Coupon Configuration
VITE_COUPON_FIRST100_DISCOUNT=100
VITE_COUPON_WORTHYONE10_DISCOUNT=10
```

### 2. Supabase Edge Functions Environment

Set these in your Supabase project settings:

```env
RAZORPAY_KEY_ID=rzp_live_U7N6E8ot31tiej
RAZORPAY_KEY_SECRET=HG2iWDiXa39rXibjCYQYxDs5
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Razorpay Webhook Configuration

**IMPORTANT**: Configure webhook URL in Razorpay Dashboard:

```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/razorpay-webhook
```

Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID.

**Steps to configure webhook:**
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → Webhooks
3. Click "Add New Webhook"
4. Enter the webhook URL above
5. Select events: `payment.captured`, `payment.failed`
6. Set webhook secret and add it to your Supabase environment variables as `RAZORPAY_WEBHOOK_SECRET`
7. Save the webhook

### 4. Database Setup

The database schema is automatically created via migrations:

- **user_profiles**: User account data
- **subscriptions**: Active subscriptions with usage tracking
- **payment_transactions**: Payment history and audit trail

## 💰 Subscription Plans

| Plan | Price | Duration | Optimizations | Features |
|------|-------|----------|---------------|----------|
| Daily | ₹39 | 1 Day | 5 | Basic features |
| Weekly | ₹129 | 7 Days | 25 | + Project Analysis |
| Monthly | ₹349 | 30 Days | 100 | + Priority Support |
| Yearly | ₹1299 | 365 Days | 1000 | + All Premium Features |

## 🎫 Available Coupons

### FIRST100
- **Discount**: 100% off
- **Use Case**: First-time users
- **Validity**: Until 2024-12-31

### WORTHYONE10
- **Discount**: 10% off
- **Use Case**: All users
- **Validity**: Until 2024-12-31

## 🔒 Security Features

### Payment Security
- **Server-side Verification**: All payments verified server-side
- **Signature Validation**: Razorpay signature verification
- **No Client Secrets**: Sensitive keys never exposed to frontend
- **Webhook Security**: Signed webhook verification

### Database Security
- **Row Level Security**: User data isolation
- **Authentication Required**: All operations require auth
- **Audit Trail**: Complete payment and usage history
- **Data Encryption**: Supabase-managed encryption

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy to your preferred hosting platform
```

### Backend Deployment
Edge functions are automatically deployed to Supabase.

### Environment Variables
- **Development**: Use `.env` file
- **Production**: Set in hosting platform environment

## 📊 Usage Flow

### 1. User Registration
- User signs up with email/password
- Profile automatically created in database
- Authentication managed by Supabase

### 2. Subscription Purchase
- User selects plan and applies coupon
- Frontend calls `/create-order` edge function
- Razorpay payment modal opens
- Payment processed securely

### 3. Payment Verification
- Frontend receives payment response
- Calls `/verify-payment` edge function
- Server verifies signature with Razorpay
- Subscription created in database

### 4. Webhook Processing
- Razorpay sends webhook to `/razorpay-webhook`
- Server verifies webhook signature
- Updates subscription status if needed
- Ensures data consistency

### 5. Resume Optimization
- User uploads resume and job description
- System checks active subscription
- Decrements usage count
- Returns optimized resume

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run Supabase locally (optional)
supabase start
```

### Testing Payments
Use Razorpay test credentials for development:
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## 🔧 Troubleshooting

### Common Issues

1. **Payment Verification Failed**
   - Check Razorpay webhook configuration
   - Verify environment variables
   - Check signature validation

2. **Subscription Not Created**
   - Check edge function logs
   - Verify database permissions
   - Check RLS policies

3. **Usage Count Not Updating**
   - Check database function execution
   - Verify user authentication
   - Check subscription status

4. **Webhook Not Working**
   - Verify webhook URL is correct: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/razorpay-webhook`
   - Check webhook secret in environment variables
   - Verify webhook events are selected in Razorpay dashboard

## 📝 API Documentation

### Edge Functions

#### `/create-order`
Creates a Razorpay order for payment processing.

**Request:**
```json
{
  "planId": "monthly",
  "couponCode": "FIRST100"
}
```

**Response:**
```json
{
  "orderId": "order_xyz",
  "amount": 349,
  "currency": "INR",
  "keyId": "rzp_live_..."
}
```

#### `/verify-payment`
Verifies payment signature and creates subscription.

**Request:**
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_123",
  "message": "Payment verified successfully"
}
```

#### `/razorpay-webhook`
Handles Razorpay webhook events for payment updates.

**Webhook URL**: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/razorpay-webhook`

**Events**: `payment.captured`, `payment.failed`

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

For technical support or questions:
- Check the troubleshooting section
- Review Supabase logs
- Check Razorpay dashboard for payment issues
- Contact development team

---

**Note**: This implementation provides a production-ready payment system with proper security measures, real-time database integration, and comprehensive error handling.