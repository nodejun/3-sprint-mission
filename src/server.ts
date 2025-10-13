import 'dotenv/config';
import app from './app';
import { verifySocketToken } from './middlewares/auth';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { EventType } from '../types/socket';


const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

io.on(EventType.CONNECTION, (socket) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('토큰이 제공되지 않았습니다. 연결을 종료합니다.');
    socket.disconnect();
    return;
  }
  try {
    const { userId } = verifySocketToken(token);
    socket.join(userId);
    console.log(`사용자 ${userId}가 연결에 입장했습니다.`);
    socket.on(EventType.DISCONNECT, () => {
      console.log(`사용자 ${userId}가 연결 해제되었습니다.`);
    });
  } catch (error) {
    socket.emit('error', '유효하지 않은 토큰입니다. 연결이 종료됩니다.');
    socket.disconnect();
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('데이터베이스 연결 상태를 확인하세요.');
  });
}

export { io };