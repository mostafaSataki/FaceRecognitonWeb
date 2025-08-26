import { Server } from 'socket.io';
import { cameraStreamingService } from './services/cameraStreaming';

export const setupSocket = (io: Server) => {
  // Set socket server for camera streaming service
  cameraStreamingService.setSocketServer(io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle camera control events
    socket.on('startCamera', async (cameraId: string) => {
      try {
        await cameraStreamingService.startCamera(cameraId);
        socket.emit('cameraStarted', { cameraId });
      } catch (error) {
        socket.emit('cameraError', { cameraId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    socket.on('stopCamera', async (cameraId: string) => {
      try {
        await cameraStreamingService.stopCamera(cameraId);
        socket.emit('cameraStopped', { cameraId });
      } catch (error) {
        socket.emit('cameraError', { cameraId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    socket.on('getActiveCameras', () => {
      const activeCameras = cameraStreamingService.getActiveCameras();
      socket.emit('activeCameras', activeCameras);
    });

    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Face Detection WebSocket Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Send initial active cameras
    const activeCameras = cameraStreamingService.getActiveCameras();
    socket.emit('activeCameras', activeCameras);
  });
};