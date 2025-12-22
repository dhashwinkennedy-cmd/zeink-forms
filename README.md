# 🔴 Zienk Forms Engine

A high-performance, AI-integrated form builder inspired by Typeform and Google Forms. Built with React, Tailwind CSS, Firebase, and Google Gemini.

## 🚀 Quick Start

1. **Clone the project**
   ```bash
   git clone https://github.com/YOUR_USERNAME/zienk-forms.git
   ```

2. **Setup Environment Variables**
   Create a `.env` file or add these to your deployment platform (Vercel/Netlify):
   - `API_KEY`: Your Google Gemini API Key
   - `FIREBASE_API_KEY`: Your Firebase API Key
   - `FIREBASE_PROJECT_ID`: Your Firebase Project ID
   - (And other Firebase variables as seen in `services/firebase.ts`)

3. **Run the app**
   Since this app uses ESM modules, you can serve it using any local server:
   ```bash
   npx serve .
   ```

## 🛠 Features
- **AI Evaluation**: Automatic grading of long-text answers using Gemini 3 Pro.
- **Smart Logic**: Conditional redirection and page-based navigation.
- **Cloud Sync**: Real-time saving and response tracking via Firebase.
- **Mobile First**: Fully responsive design for creation and responding.

## 📦 Project Structure
- `/components`: UI units (Auth, Dashboard, Editors).
- `/services`: API integrations (Firebase, Gemini, OTP).
- `types.ts`: Global TypeScript definitions.
