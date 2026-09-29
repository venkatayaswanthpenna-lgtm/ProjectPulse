# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\venka\OneDrive\Desktop\26122\projectpulse\backend; python -m pip install -r requirements.txt; python seed.py; uvicorn app.main:app --host 127.0.0.1 --port 8000"

# Start frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\venka\OneDrive\Desktop\26122\projectpulse\frontend; npm run dev"

# Open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
