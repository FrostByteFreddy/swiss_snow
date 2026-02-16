# Swiss Snow Calculator

A modern, high-fidelity snow forecast calculator tailored for Swiss peaks. Features a card-centric informational UI with real-time data integration.

## 🚀 Quick Start

### 1. Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
```
*Runs on `http://127.0.0.1:5001`*

### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173` (or similar)*

## 📂 Project Structure
- **/backend**: Flask API handling geocoding and weather predictions.
    - `app.py`: Main API entry point.
    - `Dockerfile`: Production container config.
    - `vercel.json`: Vercel serverless config.
- **/frontend**: React application with Tailwind CSS.
    - `src/App.jsx`: Main UI logic.
    - `src/index.css`: Design tokens and glassmorphism styles.

## 🌍 Deployment

### Backend
- **Vercel**: Connect the repo and point to the `/backend` directory.
- **Render**: Use the provided `Dockerfile` for a containerized deployment.

### Frontend
- **Cyon / Static Hosting**: Build with `npm run build` and upload the `dist` folder.
- **Environment Variables**: Set `VITE_API_BASE_URL` to your production backend URL.

## 🛠 Tech Stack
- **Backend**: Python, Flask, Open-Meteo API, Nominatim API.
- **Frontend**: React, Lucide Icons, Tailwind CSS (@tailwindcss/oxide).
- **Styling**: Modern Glassmorphism, Responsive Design.
