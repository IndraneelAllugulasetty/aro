<div align="center">
  <h1>🌱 Aro Platform</h1>
  <p><em>Next-Generation Agricultural Investment & Yield Prediction Platform</em></p>

  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe" alt="Stripe" />
</div>

<br />

## 📖 About
**Aro** is a robust, dynamic web application designed to bridge the gap between agriculture and investment. Featuring a sophisticated three-tiered user system, it connects farmers, land owners, and investors, providing tools for land listing, investment management, and data-driven crop yield prediction.

## ✨ Features

- **🛡️ Role-Based Architecture**: Secure access and customized dashboards tailored for Farmers, Investors, and Admins.
- **🌍 Land & Crop Management**: Dynamic land listings with rich geographic tracking and metadata.
- **📈 Yield Prediction**: Advanced lookups predicting crop yield, financial returns, and resource requirements.
- **💸 Investment Ecosystem**: Seamlessly integrated with Stripe for managing transparent agricultural investments.
- **🎨 Dynamic & Responsive UI**: Built with Tailwind CSS and Framer Motion for smooth micro-animations and an immersive, premium user experience.
## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Backend & DB**: Next.js Server Actions, Prisma ORM, SQLite
- **Security & Validation**: Jose (JWT), bcryptjs, Zod
- **Payments**: Stripe API

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IndraneelAllugulasetty/aro.git
   cd aro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Ensure your `.env` file is configured with your database URL, JWT secret, and Stripe API keys.

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
Pls contribute in this page;
---
<div align="center">
  <sub>Built with ❤️ by Indraneel Allugulasetty</sub>
</div>
