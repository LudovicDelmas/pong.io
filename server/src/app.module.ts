import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { GameService } from './game/game.service';

@Module({
  imports: [GatewayModule],
  controllers: [AppController],
  providers: [AppService, GameService],
})
export class AppModule {}
