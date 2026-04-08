# HopePMS — Hope, Inc. Product Management System

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/<your-org>/hopepms.git
cd hopepms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Open `.env` and fill in the values from the shared Supabase project:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App
```bash
npm run dev
```

App runs at **http://localhost:5173**