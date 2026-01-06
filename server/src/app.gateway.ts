import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { generate } from 'random-words';
import { Server, Socket } from 'socket.io';

interface ClientInfo {
  username: string;
  room: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
  },
})
export class SocketIOGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  rooms: Map<string, Set<Socket>> = new Map();
  clients: Map<Socket, ClientInfo> = new Map();

  afterInit(_server: Server) {
    this.rooms.set('lobby', new Set());
    this.rooms.set(generate(1)[0], new Set());
    this.rooms.set(generate(1)[0], new Set());
    this.rooms.set(generate(1)[0], new Set());
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: { room: string }) {
    if (this.rooms.has(data.room)) {
      const room = this.rooms.get(data.room);
      if (!room?.has(client)) {
        this.rooms.get(this.clients.get(client)!.room)?.delete(client);
        room?.forEach((c) =>
          c.emit('join', this.clients.get(client)?.username),
        );
        room?.add(client);
        client.emit('joinsuccess');
        this.clients.get(client)!.room = data.room;
      }
    }
  }

  @SubscribeMessage('login')
  handleLogin(client: Socket, data: { username: string }) {
    if (data.username != '' && !this.clients.has(client)) {
      this.clients.set(client, { room: 'lobby', username: data.username });
      client.emit('login', true, [...this.rooms.keys()]);
      this.rooms.get('lobby')?.add(client);
      this.rooms
        .get('lobby')
        ?.forEach((client) => client.emit('join', data.username));
    } else {
      client.emit('login', 'Empty username or already joined !');
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, data: { message: string }) {
    const room = this.clients.get(client)?.room ?? '';
    if (!this.rooms.has(room)) {
      //error
    } else {
      if (!this.rooms.get(room)?.has(client)) {
        //error
      } else {
        this.rooms
          .get(room)
          ?.forEach((c) =>
            c.emit(
              'message',
              new Date().toISOString(),
              this.clients.get(client)?.username ?? 'unknown client',
              data.message,
            ),
          );
      }
    }
  }
}
