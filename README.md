Field Report Generator

Field Report Generator is a modern, responsive web application designed to help organizations efficiently create, store, and manage professional field visit reports. Built with React, TypeScript, Supabase, and Tailwind CSS, it supports role-based authentication, secure access, PDF report generation, and offline functionality.


---

🌟 Features

🔐 Role-based Authentication (HOC, VO, SO)

📝 Create & Edit Field Reports

📂 Reports History View

📄 PDF Report Generation

👤 User Dashboard with Email Avatar & Last Login

🌗 Dark/Light Mode Toggle

🎨 Animated Galaxy Background (Auth Page)

🚀 Progressive Web App (PWA) Support

🔒 Secure Authentication with Supabase



---

📁 Project Structure

/src
├── app/              # Route pages
├── components/       # Reusable UI and feature components
├── hooks/            # Custom React hooks (e.g., useAuth, useReports)
├── integrations/     # Supabase client setup
├── types/            # Shared TypeScript types
├── utils/            # Utility functions
└── styles/           # Global styles and Tailwind config


---

🛠️ Tech Stack

Frontend: React + TypeScript

Styling: Tailwind CSS + shadcn/ui

Authentication & Database: Supabase

PDF Generator: jsPDF

Routing: React Router

Animations: Framer Motion + Custom Canvas Particles



---

🔧 Setup & Installation

1. Clone the Repository:

git clone https://github.com/yourusername/field-report-generator.git
cd field-report-generator


2. Install Dependencies:

npm install


3. Configure Supabase:

Create a project at https://supabase.io

Set up SUPABASE_URL and SUPABASE_ANON_KEY in your .env file



4. Start Development Server:

npm run dev


5. Build for Production:

npm run build
npm run preview




---

📦 Environment Variables

Create a .env file in the root and add:

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key


---

🤝 Contributing

We welcome contributions from the community. If you'd like to:

Suggest new features

Report a bug

Submit pull requests


Please open an issue or contact the maintainer.


---

📄 License

This project is licensed under the MIT License. Feel free to use and adapt it for your own needs.


---

👤 Author

Excel Shogbola

> Built with care to simplify field operations.

