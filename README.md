# Tender Evaluator - AI-Powered Tender Analysis System

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive web-based platform for analyzing tender documents and bid proposals using Google's Gemini AI. This system automates tender evaluation, compliance checking, and project comparison with sector-agnostic validation suitable for pan-India government tenders.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [MCP Server (Claude Desktop)](#-mcp-server-claude-desktop)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [What We Learned](#-what-we-learned)

---

## ✨ Features

### Core Capabilities
- **AI-Powered Analysis**: Automated tender/DPR analysis using Google Gemini 2.0 Flash
- **Multi-Language Support**: Full i18n support for English, Hindi, and regional languages
- **Pan-India Tender Evaluation**: Customized compliance criteria for government tenders across India
  - Technical Feasibility & Design: 20% - Engineering solution compatibility
  - Implementation Schedule: 15% - Timeline realism and critical path analysis
  - Cost Estimate & BOQ: 25% - Bill of Quantities accuracy and market rate comparison
  - Risk Mitigation & Environment: 15% - Risk assessment and regulatory compliance
  - Financial Viability: 15% - FIRR, NPV, and payback period analysis
  - Resource Allocation & Site: 10% - Land acquisition, utilities, and site readiness
- **Interactive Chat**: AI assistant for project-specific queries with context-aware responses
- **Comparative Analysis**: Multi-tender comparison with AI-generated recommendations
- **PDF Generation**: Automated report generation with charts and visualizations

### Advanced Features
- **PDF Evidence Highlighting**: Interactive highlighting of text evidence directly in the PDF viewer
  - Clickable evidence links in Risk Assessment, Compliance, and Inconsistency tabs
  - Fuzzy text matching algorithm for accurate highlighting across PDF text layers
  - Visual feedback with yellow/orange highlighting and pulsing animations
  - Automatic PDF page navigation when clicking on evidence references
- **State/Sector Validation**: Automatic flagging of location and sector mismatches
- **Enum Constraints**: Strict validation for tender types and project categories
- **Financial Analysis**: Detailed cost breakdowns, ROI calculations, DSCR/IRR metrics
- **Risk Assessment**: Multi-dimensional risk evaluation with severity classifications
- **Environmental Impact**: Compliance tracking for clearances and sensitive zones
- **Inconsistency Detection**: Automated identification of data conflicts in DPRs

### User Management
- **Role-Based Access**: Separate admin and client interfaces
- **Secure Authentication**: Password hashing with bcrypt
- **Project Organization**: Hierarchical project-DPR management
- **Status Tracking**: Real-time analysis status and feedback system

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Framework**: FastAPI (Python 3.9+)
- **Database**: PostgreSQL (cloud-hosted)
- **File Storage**: Cloudinary (PDF storage)
- **AI Engine**: Google Gemini 2.0 Flash
- **PDF Processing**: Gemini File API, WeasyPrint
- **Visualization**: Plotly, Kaleido

**Frontend:**
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Styling**: TailwindCSS 3.3
- **UI Components**: Lucide React icons, custom components
- **Charts**: Recharts 3.4
- **PDF Viewer**: React-PDF 7.7
- **Maps**: React-Leaflet 5.0

**MCP Server:**
- **Protocol**: Model Context Protocol
- **Client**: Claude Desktop
- **Transport**: stdio
- **Tools**: 17 admin tools for project management

### System Design

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ◄─────► │   FastAPI    │ ◄─────► │   Gemini    │
│  (React)    │  REST   │   Backend    │   API   │     AI      │
└─────────────┘         └──────────────┘         └─────────────┘
                               │  │
                    ┌──────────┘  └──────────┐
                    ▼                        ▼
             ┌──────────────┐         ┌──────────────┐
             │  PostgreSQL  │         │  Cloudinary  │
             │   Database   │         │    (PDFs)    │
             └──────────────┘         └──────────────┘
                    ▲
                    │
             ┌──────────────┐
             │  MCP Server  │
             │(Claude Tools)│
             └──────────────┘
```

---

## 📦 Prerequisites

### System Requirements
- **Python**: 3.9 or higher
- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher
- **PostgreSQL**: 14.0 or higher (setup locally or use cloud)
- **Memory**: 4GB RAM minimum
- **Storage**: 500MB for dependencies

### API Keys & Services
- **Google Gemini API Key**: Required for AI analysis
  - Get your free API key: https://ai.google.dev/
- **Cloudinary Account**: Required for PDF storage
  - Sign up free: https://cloudinary.com/
- **PostgreSQL Database**: Required for data persistence

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aangir14/SIH-first.git
cd SIH-first
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p data templates/reports

# Initialize database
python -c "import backend.db as db; db.init_db()"
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Return to root
cd ..
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory (get from team lead):

```env
# === REQUIRED: AI ===
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_gemini_api_key

# === REQUIRED: Database ===
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=dpr_analyzer
DB_USER=your_username
DB_PASSWORD=your_password

# === REQUIRED: File Storage ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# === OPTIONAL: Server ===
HOST=127.0.0.1
BACKEND_PORT=8000
FRONTEND_PORT=5000
```

> **Note:** Contact your team lead for the `.env` file with credentials.

### First-Time Setup

```bash
# Verify database connection
python -c "import backend.db as db; print(db.test_connection())"
```

---

## 🤖 MCP Server (Claude Desktop)

The project includes an MCP (Model Context Protocol) server with **17 admin tools** for managing DPRs directly from Claude Desktop.

### Quick Setup

```bash
# Install MCP dependencies
cd mcp-server/mcp-server/mcp-server
pip install -r requirements.txt

# Test connection
python db_client.py
```

### Available Tools

| Category | Tools |
|----------|-------|
| **Read-Only** | `list_projects`, `get_project_details`, `list_all_dprs`, `get_dpr_analysis`, `get_project_comparison`, `get_compliance_info` |
| **Admin Actions** | `approve_dpr`, `reject_dpr`, `send_feedback_to_dpr`, `trigger_comparison` |
| **Project Mgmt** | `create_project`, `delete_project`, `delete_dpr`, `trigger_dpr_analysis` |
| **Batch Ops** | `approve_and_reject_others`, `batch_approve_dprs`, `send_bulk_feedback` |

📖 **See [MCP_SETUP.md](MCP_SETUP.md) for detailed setup instructions.**

---

## 💻 Usage

### Development Mode

**Start Backend Server:**
```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5000
```

**Access the Application:**
- Frontend: http://127.0.0.1:5000
- Backend API: http://127.0.0.1:8000
- API Documentation: http://127.0.0.1:8000/docs

### Production Mode

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start production server
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📚 API Documentation

### Authentication Endpoints

**Admin Login**
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Client Login**
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Project Management

**Create Project**
```http
POST /projects
Content-Type: application/json

{
  "name": "Highway Construction Project",
  "state": "Assam",
  "sector": "Roads and Bridges"
}
```

**Get Projects**
```http
GET /projects
```

**Get Project Details**
```http
GET /projects/{project_id}
```

### DPR Management

**Upload DPR (Client)**
```http
POST /api/client/dprs/upload?client_id=1
Content-Type: multipart/form-data

file: <PDF file>
project_id: 1
```

**Analyze DPR**
```http
POST /dprs/{dpr_id}/analyze
```

**Get DPR Analysis**
```http
GET /dpr/{dpr_id}
```

**Compare DPRs**
```http
POST /projects/{project_id}/compare-all
```

### Chat Endpoints

**Send Chat Message**
```http
POST /dpr/{dpr_id}/chat
Content-Type: application/json

{
  "message": "What is the total project cost?"
}
```

**Get Chat History**
```http
GET /dpr/{dpr_id}/chat/history
```

---

## 📁 Project Structure

```
sih-login/
├── backend/
│   ├── __init__.py
│   ├── app.py                    # FastAPI application
│   ├── db.py                     # Database operations
│   ├── gemini_client.py          # Gemini AI integration
│   ├── report_generator.py       # PDF report generation
│   ├── compliance_calculator.py  # Compliance scoring
│   ├── translation_service.py    # i18n support
│   ├── schema.json              # DPR analysis schema
│   └── templates/
│       └── reports/
│           └── dpr_report.html  # Report template
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   ├── lib/                 # Utilities
│   │   ├── pages/               # Page components
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   └── dpr.db                   # SQLite database
├── .env                         # Environment variables
├── requirements.txt             # Python dependencies
├── README.md                    # This file
└── start.sh                     # Startup script
```

---

## 🌐 Deployment

### Docker Deployment (Recommended)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Build frontend
RUN cd frontend && npm install && npm run build

EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment

**Supported Platforms:**
- AWS EC2 / Elastic Beanstalk
- Google Cloud Run / Compute Engine
- Azure App Service
- Railway / Render / Fly.io

**Environment Configuration:**
1. Set `GEMINI_API_KEY` as environment variable
2. Configure database persistence
3. Set up file storage for uploaded PDFs
4. Enable HTTPS

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: Gemini API quota exceeded
```
Solution: Wait for quota reset or upgrade to paid tier
Check usage: https://ai.dev/usage?tab=rate-limit
```

**Issue**: Database locked errors
```bash
# Reset database
rm data/dpr.db
python -c "import backend.db as db; db.init_db()"
```

**Issue**: Frontend build fails
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- **Python**: Follow PEP 8
- **TypeScript**: Use ESLint configuration
- **Commits**: Use conventional commits format

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Kabir Ahuja** - Initial work - [aangir14](https://github.com/aangir14)

---

## 🙏 Acknowledgments

- Government of India for infrastructure evaluation requirements
- Google Gemini team for AI capabilities
- FastAPI and React communities for excellent frameworks
- All contributors and testers

---

## 📚 What We Learned

Building this project provided hands-on experience with a comprehensive tech stack and modern development practices:

### Backend Development
- **FastAPI Framework**: Building RESTful APIs with automatic OpenAPI documentation, async/await patterns, dependency injection, and request validation using Pydantic models
- **PostgreSQL Database**: Designing relational schemas, writing SQL queries, connection pooling, and database migrations
- **Python Async Programming**: Using `asyncio`, async context managers, and concurrent task execution
- **File Handling**: Processing PDF uploads, temporary file management, and cloud storage integration
- **Authentication & Security**: Implementing bcrypt password hashing, session management, and role-based access control

### AI & Machine Learning Integration
- **Google Gemini API**: Integrating generative AI for document analysis, structured JSON output generation, and multi-turn chat sessions
- **Prompt Engineering**: Crafting detailed system prompts with JSON schemas to get consistent, structured responses from LLMs
- **File Upload to AI**: Using Gemini's File API for processing large PDF documents
- **Error Handling for AI**: Managing rate limits, file expiration, and retry logic for AI API calls

### Frontend Development
- **React 18**: Modern React patterns including hooks (`useState`, `useEffect`, `useRef`, `useCallback`), context API for global state, and component composition
- **TypeScript**: Type safety, interfaces, generic types, and strict null checking
- **Vite Build Tool**: Fast development server, hot module replacement, and optimized production builds
- **TailwindCSS**: Utility-first CSS, responsive design, dark mode support, and custom theme configuration
- **React Router**: Client-side routing, navigation guards, and URL parameter handling

### PDF Processing & Visualization
- **React-PDF Integration**: Rendering PDF documents in the browser, text layer extraction, and page navigation
- **PDF Text Highlighting**: Implementing fuzzy text search algorithms, DOM manipulation for overlay creation, and CSS animations
- **Recharts**: Building interactive charts and data visualizations for financial analysis
- **React-Leaflet**: Integrating interactive maps for project location visualization

### Design Patterns & Architecture
- **Component-Based Architecture**: Creating reusable UI components with props and composition
- **State Management**: Managing complex state across components using React Context
- **API Client Pattern**: Centralized API handling with error management and response typing
- **Internationalization (i18n)**: Multi-language support with translation dictionaries

### Cloud Services & DevOps
- **Cloudinary**: Cloud-based PDF storage, secure URL generation, and file management
- **Environment Configuration**: Managing secrets with `.env` files and environment variables
- **CORS Configuration**: Setting up cross-origin resource sharing for frontend-backend communication
- **Static File Serving**: Configuring FastAPI to serve static assets and uploaded files

### MCP (Model Context Protocol) Server
- **Protocol Implementation**: Building a stdio-based server for Claude Desktop integration
- **Tool Definition**: Creating structured tools with JSON schemas for AI agent use
- **Database Client**: Building API clients for database operations from external services

### Development Best Practices
- **Git Version Control**: Branching strategies, commit conventions, and collaborative development
- **Code Organization**: Modular file structure, separation of concerns, and clean code principles
- **Error Handling**: Comprehensive try-catch blocks, user-friendly error messages, and logging
- **Debugging**: Using console logs, browser DevTools, and systematic debugging approaches
- **Documentation**: Writing clear READMEs, inline comments, and API documentation

---

## 📞 Support

For support and queries:
- **Issues**: https://github.com/aangir14/SIH-first/issues
- **Email**: support@dpranalyzer.com

---

**Built with ❤️ for Smart India Hackathon 2024**
