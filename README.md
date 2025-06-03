# Discord Clone

A full-featured Discord clone with real-time messaging, user authentication, server management, and more.

## Features

- **User Authentication**: Register, login, and manage your profile
- **Servers**: Create and manage servers with multiple channels
- **Channels**: Text and voice channels for communication
- **Direct Messaging**: Private conversations between users
- **Friend System**: Send and accept friend requests
- **Real-time Communication**: Instant messaging using WebSockets
- **User Presence**: See who's online and their status
- **File Sharing**: Share images and files in chats
- **Responsive UI**: Beautiful interface that works on all devices

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- TailwindCSS for styling
- Framer Motion for animations
- Socket.io client for real-time communication

### Backend
- Flask (Python)
- Flask-SocketIO for WebSockets
- Flask-CORS for cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd discord-clone
```

2. Install frontend dependencies
```
npm install
```

3. Install backend dependencies
```
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server
```
cd backend
python app.py
```

2. In a new terminal, start the frontend development server
```
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
discord-clone/
├── backend/               # Flask backend
│   ├── app.py             # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   └── data/              # Data storage (created at runtime)
├── public/                # Static assets
├── src/                   # React frontend
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and API client
│   ├── pages/             # Page components
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Entry point
└── package.json           # Node.js dependencies
```

## Deployment

To deploy the application:

1. Build the frontend
```
npm run build
```

2. Serve the built frontend with a static file server

3. Deploy the Flask backend to a server with Python support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Discord
- Built with React and Flask