# Face Detection System with Real-time Video Streaming

A comprehensive real-time face detection system built with Next.js, TensorFlow.js, and WebRTC. This system allows users to connect RTSP cameras, process video streams for face detection, and view results in real-time through a modern web interface.

## Features

- **Real-time Face Detection**: Uses TensorFlow.js and MediaPipe for accurate face detection
- **RTSP Camera Support**: Connect and manage multiple RTSP cameras
- **Live Video Streaming**: WebRTC-based low-latency video streaming
- **WebSocket Integration**: Real-time updates for face detections
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Database Storage**: SQLite database with Prisma ORM for storing cameras and detections
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Architecture

### System Components

1. **Frontend (React/Next.js)**
   - Camera management dashboard
   - Real-time detection feed
   - Live video player with WebRTC
   - Camera grid with status indicators

2. **Backend (Next.js API Routes)**
   - RESTful API for camera management
   - WebSocket server for real-time updates
   - Face detection processing service
   - Database operations with Prisma

3. **Database (SQLite)**
   - Camera configuration storage
   - Detection results with metadata
   - Optimized for real-time queries

4. **Face Detection Engine**
   - TensorFlow.js with MediaPipe Face Mesh
   - Client-side processing for reduced server load
   - Configurable detection intervals

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Face Detection**: TensorFlow.js, MediaPipe Face Mesh
- **Real-time Communication**: Socket.IO, WebRTC
- **Database**: SQLite with Prisma ORM
- **State Management**: Zustand, TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- RTSP camera streams for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd face-detection-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding a Camera

1. Click the "Add Camera" button on the dashboard
2. Enter a camera name and RTSP URL
3. Click "Add Camera" to save

Example RTSP URL format:
```
rtsp://username:password@camera-ip:554/stream
```

### Managing Cameras

- **Start/Stop**: Toggle camera processing to begin/end face detection
- **Live View**: Click the eye icon to view the live video stream
- **Delete**: Remove a camera from the system

### Viewing Detections

- **Recent Detections**: View the latest face detections in the main dashboard
- **Real-time Feed**: Monitor live detections in the right sidebar
- **Detection Details**: Expand detection cards to view metadata and coordinates

## API Reference

### Cameras

#### GET /api/cameras
Get all cameras with recent detections

#### POST /api/cameras
Add a new camera
```json
{
  "name": "Camera 1",
  "rtspUrl": "rtsp://username:password@camera-ip:554/stream"
}
```

#### GET /api/cameras/[id]
Get a specific camera with detection history

#### DELETE /api/cameras/[id]
Delete a camera

#### PATCH /api/cameras/[id]
Update camera status
```json
{
  "isActive": true
}
```

### Detections

#### GET /api/detections
Get all detections with optional filtering
```
?cameraId=camera-id&limit=50
```

#### POST /api/detections
Create a new detection record (internal use)

## Configuration

### Face Detection Settings

The face detection service can be configured in `src/lib/services/faceDetection.ts`:

- **frameSkipCount**: Process every Nth frame (default: 5)
- **maxFaces**: Maximum faces to detect per frame (default: 10)
- **refineLandmarks**: Enable landmark refinement (default: true)

### WebSocket Events

#### Client to Server

- `startCamera`: Start processing a camera
- `stopCamera`: Stop processing a camera
- `getActiveCameras`: Request list of active cameras

#### Server to Client

- `faceDetected`: New face detection event
- `cameraStarted`: Camera processing started
- `cameraStopped`: Camera processing stopped
- `cameraError`: Camera processing error
- `activeCameras`: List of active cameras

## Performance Optimization

### Frame Processing

- **Frame Skipping**: Processes every 5th frame by default to reduce CPU usage
- **Asynchronous Processing**: Non-blocking face detection using Web Workers
- **Memory Management**: Automatic cleanup of unused resources

### Database Optimization

- **Indexed Queries**: Optimized database queries for real-time performance
- **Connection Pooling**: Efficient database connection management
- **Data Pruning**: Configurable retention policies for detection data

## Security Considerations

- **Input Validation**: All user inputs are validated and sanitized
- **RTSP Authentication**: Camera credentials are securely stored
- **CORS Protection**: Proper cross-origin resource sharing configuration
- **Rate Limiting**: API endpoints are protected against abuse

## Troubleshooting

### Common Issues

1. **Camera Connection Failed**
   - Verify RTSP URL format and credentials
   - Check network connectivity to camera
   - Ensure camera supports RTSP streaming

2. **Face Detection Not Working**
   - Check browser compatibility with TensorFlow.js
   - Verify camera stream is active
   - Check JavaScript console for errors

3. **WebSocket Connection Issues**
   - Verify server is running on correct port
   - Check firewall settings
   - Ensure WebSocket protocol is supported

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=face-detection:* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.