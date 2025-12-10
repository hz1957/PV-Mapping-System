#!/bin/bash

# ==========================================
# PV Mapping System - Operations Script
# ==========================================

# Exit on error
set -e

# Configuration
CONDA_ENV_NAME="pv-demo"
PYTHON_CMD="python"
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Check if we are in the correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory (must contain 'backend' and 'frontend')."
    exit 1
fi

echo "=== PV Mapping System Deployment/Run Script ==="

# 1. Environment Check
echo ""
echo "[1/4] Checking Environment..."
if command -v conda &> /dev/null; then
    echo "Conda detected."
    # Note: Activating conda in shell script can be tricky. 
    # We assume the user has activated it or we use the current python if distinct.
    if [ -z "$CONDA_DEFAULT_ENV" ]; then
        echo "Warning: No Conda environment active. Please ensure you are in '$CONDA_ENV_NAME' or valid env."
    else
        echo "Active Conda Env: $CONDA_DEFAULT_ENV"
    fi
else
    echo "Conda not detected. Using system python."
fi

# 2. Backend Setup
echo ""
echo "[2/4] Setting up Backend..."
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt -q
echo "Backend dependencies installed."

# 3. Frontend Setup
echo ""
echo "[3/4] Setting up Frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Node modules not found. Installing..."
    npm install --prefix frontend
else
    echo "Node modules found. Skipping install (run 'npm install --prefix frontend' manually if needed)."
fi

# 4. Action Selection
echo ""
echo "[4/4] Selection Action"
echo "--------------------------------"
echo "1) Dev Mode (Run Backend + Frontend with Hot Reload)"
echo "2) Build Frontend (Production Build)"
echo "3) Clean (Remove node_modules, dist, __pycache__)"
echo "--------------------------------"
read -p "Select validation option [1]: " action
action=${action:-1}

if [ "$action" == "1" ]; then
    echo ""
    echo "=== Starting Development Environment ==="
    echo "Backend: http://localhost:$BACKEND_PORT"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
    echo "Press CTRL+C to stop all services."
    echo ""

    # Function to handle kill
    cleanup() {
        echo ""
        echo "Stopping services..."
        kill $BACKEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        exit
    }
    trap cleanup SIGINT SIGTERM

    # Check/Kill Port 8000 (Backend)
    if lsof -i :$BACKEND_PORT -t >/dev/null; then
        echo "Port $BACKEND_PORT is busy. Killing existing process..."
        lsof -i :$BACKEND_PORT -t | xargs kill -9
        sleep 1
    fi
    
    # Check/Kill Port $FRONTEND_PORT (Frontend)
    if lsof -i :$FRONTEND_PORT -t >/dev/null; then
        echo "Port $FRONTEND_PORT is busy. Killing existing process..."
        lsof -i :$FRONTEND_PORT -t | xargs kill -9
        sleep 1
    fi

    # Start Backend
    echo "Starting Backend (Uvicorn)..."
    uvicorn backend.app.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT &
    BACKEND_PID=$!

    # Wait a bit for backend
    sleep 2

    # Start Frontend
    echo "Starting Frontend (Vite)..."
    # Note: Passing port to vite
    npm run dev --prefix frontend -- --port $FRONTEND_PORT &
    FRONTEND_PID=$!

    # Wait for processes
    wait
    
elif [ "$action" == "2" ]; then
    echo ""
    echo "=== Building for Production ==="
    npm run build --prefix frontend
    echo ""
    echo "Build success! Artifacts are in ./frontend/dist/"
    echo "You can deploy ./frontend/dist/ to any static site host (Nginx, Apache, S3)."
    
elif [ "$action" == "3" ]; then
    echo ""
    echo "=== Cleaning Project ==="
    echo "Removing frontend/node_modules..."
    rm -rf frontend/node_modules
    echo "Removing frontend/dist..."
    rm -rf frontend/dist
    echo "Removing Python cache..."
    find . -type d -name "__pycache__" -exec rm -rf {} +
    echo "Clean complete."
    
else
    echo "Invalid option selected."
fi
