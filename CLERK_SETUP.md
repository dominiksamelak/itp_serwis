# Clerk Authentication Setup

This application uses Clerk for authentication. Follow these steps to set it up:

## 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy the following keys:
   - `Publishable Key` (starts with `pk_test_` or `pk_live_`)
   - `Secret Key` (starts with `sk_test_` or `sk_live_`)

## 3. Configure Environment Variables

Create a `.env.local` file in the root of your project and add:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## 4. Configure Clerk Dashboard

1. In Clerk Dashboard, go to **Paths**
2. Set the following:
   - **Sign-in path**: `/sign-in`
   - **Sign-up path**: `/sign-up`
   - **After sign-in URL**: `/home`
   - **After sign-up URL**: `/home`

## 5. Run the Application

```bash
npm run dev
```

## Features

- **Protected Routes**: All routes except `/sign-in` and `/sign-up` require authentication
- **User Button**: Users can see their profile and sign out from the navbar
- **Automatic Redirects**: Unauthenticated users are redirected to the sign-in page

## Customization

You can customize the authentication pages in:
- `src/app/sign-in/[[...sign-in]]/page.js`
- `src/app/sign-up/[[...sign-up]]/page.js`

The middleware configuration is in `src/middleware.js`.
