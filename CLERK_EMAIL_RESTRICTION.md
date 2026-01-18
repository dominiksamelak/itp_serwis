# Restricting Sign-ups to Approved Emails in Clerk

To limit account creation to only approved email addresses, you need to configure Clerk's allowlist feature.

## Method 1: Email Allowlist (Recommended)

### Step 1: Configure in Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. Scroll down to **Restrictions** section
5. Enable **"Restrict email addresses"**
6. Choose one of these options:

   **Option A: Allowlist specific email addresses**
   - Click **"Add email address"**
   - Enter each approved email address (e.g., `admin@it-premium.pl`, `user@it-premium.pl`)
   - Only these exact emails can sign up

   **Option B: Allowlist email domains**
   - Click **"Add email domain"**
   - Enter approved domains (e.g., `@it-premium.pl`)
   - Anyone with an email from this domain can sign up

### Step 2: Save Changes

- Click **"Save"** at the bottom of the page
- Changes take effect immediately

## Method 2: Using Clerk's Blocklist (Alternative)

If you prefer to block specific emails/domains instead:

1. In Clerk Dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Under **Restrictions**, enable **"Block email addresses"**
3. Add emails or domains to block

## Method 3: Custom Validation (Advanced)

For more complex logic, you can use Clerk's webhooks or custom validation:

1. Go to **Webhooks** in Clerk Dashboard
2. Set up a webhook for `user.created` event
3. Validate the email in your webhook handler
4. Delete the user if email is not approved

## Testing

1. Try signing up with an unapproved email - you should see an error
2. Try signing up with an approved email - it should work
3. The error message will indicate that the email is not allowed

## Current Configuration

The sign-up page has been updated to inform users that registration is restricted to authorized users only.
