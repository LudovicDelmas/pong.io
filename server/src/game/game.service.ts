import { Injectable, OnModuleInit } from '@nestjs/common';
import { Engine, World, Bodies, Body, IBodyDefinition } from 'matter-js';

export interface PlayerState {
    x: number;
    y: number;
    width: number;
    height: number;
    clientId?: string;
}
export interface BallState {
    x: number;
    y: number;
    radius: number;
}

@Injectable()
export class GameService implements OnModuleInit {
    private engine: Engine;
    private paddleOpts: IBodyDefinition = { isStatic: true };
    private ballOpts:   IBodyDefinition = { restitution: 1, friction: 0 };
    private width = 800;
    private height = 400;
  
    private paddle1: Body;
    private paddle2: Body;
    private ball:    Body;

    onModuleInit() {
        this.engine = Engine.create({ gravity: { x: 0, y: 0 } });

        // créer bodies
        this.paddle1 = Bodies.rectangle(15, this.height/2, 10, 80, this.paddleOpts);
        this.paddle2 = Bodies.rectangle(this.width-15, this.height/2, 10, 80, this.paddleOpts);
        this.ball    = Bodies.circle(this.width/2, this.height/2, 10, this.ballOpts);


        World.add(this.engine.world, [
            this.paddle1, this.paddle2, this.ball,
            // murs haut/bas
            Bodies.rectangle(this.width/2, -5, this.width, 10, { isStatic: true }),
            Bodies.rectangle(this.width/2, this.height+5, this.width, 10, { isStatic: true }),
        ]);
    }

    update(dt: number) {
        Engine.update(this.engine, dt);
    }
    
    resetBall() {
        Body.setPosition(this.ball, { x: this.width/2, y: this.height/2 });
        const speed = 5;
        Body.setVelocity(this.ball, {
            x: (Math.random() < 0.5 ? - 1 : 1) * speed,
            y: (Math.random() * 2 - 1) * speed,
        });
    }

    movePaddle(clientId: string, direction: 'up' | 'down') {
        const body = (this.paddle1 as any).clientId === clientId ? this.paddle1 :
                     (this.paddle2 as any).clientId === clientId ? this.paddle2 :
                     null;

        if(!body) return;
        const dy = direction === 'up' ? -25 : +25;
        Body.translate(body, { x: 0, y: dy });
    }

    assignPlayer(clientId: string): 'player1' | 'player2' | 'full' {
        if(!(this.paddle1 as any).clientId) {
            (this.paddle1 as any).clientId = clientId;
            return 'player1';
        } else if (!(this.paddle2 as any).clientId) {
            (this.paddle2 as any).clientId = clientId;
            return 'player2';
        } else 
        return 'full';
    }

    getState() {
        const toState = (body: Body, w: number, h: number) => ({
          x: body.position.x - w/2,
          y: body.position.y - h/2,
          width: w, height: h
        });
        return {
            
          player1: { ...toState(this.paddle1, 10, 80), clientId: (this.paddle1 as any).clientId },
          player2: { ...toState(this.paddle2, 10, 80), clientId: (this.paddle2 as any).clientId },
          ball:    { x: this.ball.position.x, y: this.ball.position.y, radius: 10 },
        };
    }
  
}
