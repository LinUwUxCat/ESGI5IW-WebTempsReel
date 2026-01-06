import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SocketIOGateway } from './app.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'clients'),
      serveRoot: '/front',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SocketIOGateway],
})
export class AppModule {}
