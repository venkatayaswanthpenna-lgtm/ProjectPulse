# ProjectPulse: Execution Truth Engine

**SIH 2026 - Problem Statement 26122**
**Team:** Mosaic

## Project Overview
ProjectPulse is an "Execution Truth Engine" that intelligently captures unstructured field updates (Daily Progress Reports, site diaries) and maps them contextually to strict L5/L6 schedule activities. It removes manual reconciliation delays, detects bottlenecks early, and ensures that the master project schedule reflects reality in near-real-time.

## Core Innovation
**The Trust Layer**: We don't blindly let AI write to the master schedule. We use LLMs to extract events, Vector Search to map them to the schedule, and output a **Confidence Score**. High confidence matches are auto-linked, saving hours. Lower confidence matches are sent to a Planner Review UI for human verification.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL + pgvector
- **AI/ML:** Google Gemini API (Extraction & Embeddings) - *Includes local fallback mocks for demo without API keys.*

## Running the Prototype (Docker)

1. Ensure Docker and Docker Compose are installed.
2. Clone the repository and navigate to the project root.
3. Start the system:
   `ash
   docker compose up --build
   `
4. Access the Frontend: http://localhost:5173
5. Access Backend API Docs: http://localhost:8000/docs

*Note: On first boot, wait about 15 seconds for PostgreSQL to initialize pgvector before the backend connects.*

## Demo Instructions (3-Minute Flow)
1. Open the application at http://localhost:5173.
2. Click **Try Live Demo** on the Landing Page.
3. Review the **Dashboard** to see the starting state of the "Metro Line Extension" project.
4. Go to **Field Update**. Click "Load Demo Data" to populate a messy field report, and click **Submit & Analyze**.
5. Observe the AI processing state. You will be redirected to the **Trust Layer**.
6. In the Trust Layer, you will see the AI's contextual matches. Notice the Confidence Scores. 
7. Click **Approve & Update Schedule** on a pending match.
8. Return to the **Dashboard** and notice the Actual Progress chart has updated instantly.

## Environment Variables
Create a .env file in the root or just use the defaults:
`
DATABASE_URL=postgresql://user:password@db:5432/projectpulse
GEMINI_API_KEY=your_gemini_api_key_here
`
*If GEMINI_API_KEY is omitted or invalid, the system automatically falls back to a deterministic mock extraction/embedding engine so the demo can proceed without internet/credits.*

## Future Scope
- Direct Primavera P6 / MS Project API integration.
- Image/Video processing for progress verification via Computer Vision.
- Automated delay forecasting based on historical productivity memory.

