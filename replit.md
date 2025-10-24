# RegistraSom - Audio Analysis Platform

## Overview
RegistraSom is a professional audio analysis platform that automatically detects BPM (beats per minute) and musical key from audio files. It also provides audio transcription using OpenAI's Whisper API. The platform features user authentication, audio upload management, and music registration capabilities.

**Current State**: Fully configured and running on Replit
**Last Updated**: October 24, 2025

## Project Architecture

### Technology Stack
- **Backend**: Python 3.11 with Flask
- **Frontend**: React + Vite (pre-built, served by Flask)
- **Database**: SQLite (local file-based database)
- **Audio Processing**: librosa, soundfile, pyloudnorm
- **AI Services**: OpenAI API for audio transcription

### Project Structure
```
/
├── app/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── static/          # Pre-built React frontend
│   │   │   ├── utils/           # Audio analysis utilities
│   │   │   │   ├── audio_analysis.py
│   │   │   │   ├── transcription.py
│   │   │   │   └── pdf_generator.py
│   │   │   ├── main.py          # Flask app entry point
│   │   │   ├── uploads/         # User-uploaded audio files
│   │   │   └── registrasom.db   # SQLite database
│   │   └── requirements.txt
│   └── frontend/
│       └── src/                 # React source code (for reference)
├── .gitignore
└── replit.md
```

### Key Features
1. **User Authentication**: JWT-based authentication with password hashing
2. **Audio Upload & Analysis**: Automatic BPM, key, and LUFS detection
3. **Audio Transcription**: AI-powered transcription using OpenAI Whisper
4. **Music Registration**: Track metadata, authors, lyrics, and contracts
5. **Audio Playback**: Built-in audio player with streaming support
6. **PDF Generation**: Export transcriptions to PDF

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for audio transcription feature

### Ports
- **Port 5000**: Flask server (serves both API and frontend)

### Database
- SQLite database stored at `app/backend/src/registrasom.db`
- Tables: User, Audio, MusicRegistration
- Automatically created on first run

## Development Setup

### Running Locally
The Flask server is configured as a workflow and starts automatically. It serves:
- Frontend at: `http://localhost:5000/`
- API endpoints at: `http://localhost:5000/api/*`

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (authenticated)
- `POST /api/upload` - Upload audio file (authenticated)
- `GET /api/my-uploads` - List user's uploads (authenticated)
- `GET /api/stats` - User statistics (authenticated)
- `GET /api/audio/<id>/stream` - Stream audio file
- `GET /api/audio/<id>/download` - Download audio file
- `POST /api/music-registration` - Create music registration (authenticated)
- `GET /api/music-registration` - List registrations (authenticated)

## Recent Changes
- **2025-10-24**: Initial Replit setup
  - Installed Python 3.11 and all dependencies
  - Configured OPENAI_API_KEY from Replit Secrets
  - Fixed Flask static folder path to serve pre-built frontend
  - Created workflow for Flask server on port 5000
  - Added .gitignore for Python and Node.js

## Deployment Notes
- The application uses a development Flask server for local testing
- For production deployment, use gunicorn (already in requirements.txt)
- Frontend is pre-built and served as static files by Flask
- No separate frontend build process needed for deployment
