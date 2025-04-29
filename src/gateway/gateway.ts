import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { Engine, Body, World, Bodies, IBodyDefinition, Events, Vector} from 'matter-js';



@WebSocketGateway({ 
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})
export class MyGateway {
    @WebSocketServer()
    server: Server;
    engine: Engine;
    ball: Body;

    player1: {
        paddle1: Body
        clientId?: string,
    }

    player2: {
        paddle2: Body,
        clientId?: string,
    }

    onModuleInit() {

        this.engine = Engine.create({
            gravity: {x: 0, y: 0}
        });

        this.player1 = { paddle1: null as any, clientId: undefined };
        this.player2 = { paddle2: null as any, clientId: undefined };

        const width = 800;
        const height = 400;
        const paddleOpts: IBodyDefinition = { isStatic: true };
        const ballOpts: IBodyDefinition = { restitution: 1, friction: 0 };

        this.player1.paddle1 = Bodies.rectangle(10 + 5, height / 2, 10, 80, paddleOpts);
        this.player2.paddle2 = Bodies.rectangle(width - 10 - 5, height / 2, 10, 80, paddleOpts);
        this.ball = Bodies.circle(width / 2, height / 2, 10, ballOpts);
        
        World.add(this.engine.world, [
            this.player1.paddle1,
            this.player2.paddle2,
            this.ball,

            Bodies.rectangle(width/2, -5, width, 10, {isStatic: true}),
            Bodies.rectangle(width/2, height+5, width, 10, {isStatic: true})
        ]);

        Events.on(this.engine, 'collisionStart', event => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                if (bodyA === this.ball || bodyB === this.ball) {
                    const x = this.ball.position.x;
                    if (x < 0) {
                      // point player2
                      // TODO: stocker score, emitter
                      this.resetBall();
                    } else if (x > width) {
                      // point player1
                      this.resetBall();
                    }
                  }
            });
        });
        
        this.server.on('connection', (socket: Socket) => {

            if (!this.player1.clientId) {
                this.player1.clientId = socket.id;
                console.log(socket.id);
                socket.emit('onConnection', { msg: 'you are player1', content: this.player1.clientId });
            } else if (!this.player2.clientId) {
                this.player2.clientId = socket.id;
                socket.emit('onConnection', { msg: 'you are player2' , content: this.player2.clientId });
            } else {
                socket.emit('onConnection', { msg: 'game full' });
            }
        });

        setInterval(() => {
            Engine.update(this.engine, 1000 / 128);
            this.server.emit('game', {
                player1: { paddle1: { x: this.player1.paddle1.position.x - 5, y: this.player1.paddle1.position.y - 40 }, clientId: this.player1.clientId},
                player2: { paddle2: { x: this.player2.paddle2.position.x - 5, y: this.player2.paddle2.position.y - 40 }, clientId: this.player2.clientId},
                ball:    { x: this.ball.position.x, y: this.ball.position.y, radius: this.ball.circleRadius }
            });
        }, 1000 / 128);
    }

    @SubscribeMessage('moveUp')
    handleMoveUp(@ConnectedSocket() client: Socket) {
        const paddle = this.getPaddleForClient(client.id);

        if(!paddle) return;

        Body.setPosition(paddle, Vector.create(paddle.position.x, paddle.position.y - 15));
    }

    @SubscribeMessage('moveDown')
    handleMoveDown(@ConnectedSocket() client: Socket) {
        const paddle = this.getPaddleForClient(client.id);
        if(!paddle) return;
        Body.setPosition(paddle, Vector.create(paddle.position.x, paddle.position.y + 15));
    }

    private getPaddleForClient(id: string): Matter.Body | null {
        if (this.player1.clientId === id) return this.player1.paddle1;
        if (this.player2.clientId === id) return this.player2.paddle2;
        return null;
    }

    private resetBall() {
        // Recentrer
        Body.setPosition(this.ball, { x: 400, y: 200 });
        // Nouvelle vitesse aléatoire
        const speed = 5;
        Body.setVelocity(this.ball, {
          x: (Math.random() < 0.5 ? -1 : 1) * speed,
          y: (Math.random() * 2 - 1) * speed
        });
    }
}