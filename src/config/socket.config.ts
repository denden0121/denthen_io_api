import { Server, Socket } from 'socket.io';

interface MessageData {
  text: string;
}


export const configureWebSockets = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ User connected: ${socket.id}`);


	socket.on('code:stream', (data) => {
		// Only accept code streams if the device sending it is actually the extension!
		if (socket.data.deviceType !== 'extension') return;

		// Broadcast the code update strictly to the web clients in the same room
		socket.to(socket.data.roomCode).emit('code:update', {
			code: data.code,
			filePath: data.filePath
		});
		});

		socket.on('disconnect', () => {
		console.log(`[${socket.data.deviceType}] disconnected from room ${socket.data.roomCode}`);
	});
	

	// socket.on('send_message', (data:  MessageData) => {
	// 	console.log('Message received:', data);
	// 	io.emit('receive_message', data);
	// });
    // Action: User joins a specific workspace room
    socket.on('room:join', (roomCode: string) => {
      socket.join(roomCode);
      console.log(` Socket ${socket.id} joined room: ${roomCode}`);
    });
    // Action: VS Code extension streams real-time code updates
    socket.on('code:stream', (data: { roomCode: string; code: string }) => {
      // Broadcast the code changes only to other users in that specific room
      socket.to(data.roomCode).emit('code:update', data.code);
    });
    // Action: Connection cleanup
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });
};





















// export const configureWebSockets = (io: Server): void => {
//   io.on('connection', (socket: Socket) => {
//     console.log(`⚡ User connected: ${socket.id}`);

//     // Action: User joins a specific workspace room
//     socket.on('room:join', (roomCode: string) => {
//       socket.join(roomCode);
//       console.log(`🏠 Socket ${socket.id} joined room: ${roomCode}`);
//     });

//     // Action: VS Code extension streams real-time code updates
//     socket.on('code:stream', (data: { roomCode: string; code: string }) => {
//       // Broadcast the code changes only to other users in that specific room
//       socket.to(data.roomCode).emit('code:update', data.code);
//     });
	
//     // Action: Connection cleanup
//     socket.on('disconnect', () => {
//       console.log(`🔌 User disconnected: ${socket.id}`);
//     });
//   });
// };
