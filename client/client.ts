import { io, Socket } from 'socket.io-client';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
}

export class DrawGame {
  private socket: Socket;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player1: Player = { x: 0, y: 0, width: 10, height: 80 };
  private player2: Player = { x: 0, y: 0, width: 10, height: 80 };
  private ball: Ball = { x: 0, y: 0, radius: 10 };

  constructor(serverUrl: string) {
    // Connexion au serveur
    this.socket = io(serverUrl);

    this.socket.connect();

    // Préparation du canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 400;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.canvas.style = 'green'; 

    // Écoute des sockets
    this.setupSocketListeners();

    // Pilotage clavier
    this.setupControls();

    // this.lunchGame();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to server with id:', this.socket.id);
    });

    this.socket.on('onConnection', (data: any) => {
      console.log(data.msg, data.content);
    });

    this.socket.on('game', (state: any) => {
      this.player1.x = state.player1.x;
      this.player1.y = state.player1.y;
      this.player2.x = state.player2.x;
      this.player2.y = state.player2.y;
      this.ball = state.ball;
      this.draw();
    });
  }

  // private lunchGame(): void{
  //   window.addEventListener('keypress', (e) => {
  //     if(e.key === 'Enter') {
  //       this.socket.emit('start');
  //     }
  //   })
  // }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
        console.log(e)      
        if (e.key === 'ArrowUp') {
        this.socket.emit('moveUp');
      } else if (e.key === 'ArrowDown') {
        this.socket.emit('moveDown');
      } else if (e.key === 'Enter') {
        this.socket.emit('reset');
      }
    });
  }

  private draw(): void {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner la balle
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner les paddles
    ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
    ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
  }
}

                        
// Initialisation
new DrawGame('http://localhost:3000');