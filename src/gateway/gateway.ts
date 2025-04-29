import { SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../game/game.service';
  
@WebSocketGateway({ cors: { origin: '*' } })
export class MyGateway {
@WebSocketServer() server: Server;

constructor(private readonly game: GameService) {}

    onModuleInit() {
        this.server.on('connection', (socket: Socket) => {
        const role = this.game.assignPlayer(socket.id);
        socket.emit('onConnection', { msg: role });
        });

        setInterval(() => {
        this.game.update(1000/60);
        this.server.emit('game', this.game.getState());
        }, 1000/60);
    }

    @SubscribeMessage('moveUp')
    onMoveUp(@ConnectedSocket() client: Socket) {
        this.game.movePaddle(client.id, 'up');
    }

    @SubscribeMessage('moveDown')
    onMoveDown(@ConnectedSocket() client: Socket) {
        this.game.movePaddle(client.id, 'down');
    }
}