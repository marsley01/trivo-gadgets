# Trivo Kenya - Premium E-commerce Store

A modern, high-performance, mobile-first e-commerce storefront for the Kenyan market, featuring a dark aesthetic, WhatsApp ordering, and a Supabase-powered Admin dashboard.

## Tech Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL Database & Authentication)
- Resend (Email Automation)
- Tailwind CSS
- Lucide React

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_WHATSAPP_NUMBER=254757512769

# CJ Dropshipping (optional — for product import feature):
CJ_EMAIL=your_cj_dropshipping_account_email
CJ_API_KEY=your_cj_dropshipping_api_key
```

### 3. Setup Supabase
1. Go to [Supabase](https://supabase.com) and create a new project.
2. In your Supabase dashboard, go to the SQL Editor.
3. Copy the contents of `database.sql` (found in the root of this project) and run it in the SQL Editor to create the tables, RLS policies, and seed data.
4. Set up an Admin user by creating an account via the Supabase Authentication UI in the dashboard.

### 4. Setup Resend
1. Go to [Resend](https://resend.com) and create an API key.
2. Add it to `.env.local`.
3. *(Important)* If you are sending emails to an audience, you must verify your domain in Resend. Otherwise, you can only send test emails to your own email address.

### 5. Run the Application
```bash
npm run dev
```
- Storefront: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin` (Requires the Supabase auth login you created)

## Features
- **Mobile-first Design**: Fluid grid and responsive typography.
- **WhatsApp Deep Linking**: Auto-populates an order message with the selected product and price.
- **Admin Dashboard**: Manage inventory inline, track stock (low stock alerts), toggle featured drops, and manage subscribers.
- **Mailing List**: Email capture powered by Resend automations.

## Deployment
This app is heavily optimized for Vercel. Connect your repository to Vercel, inject the environment variables, and deploy!
