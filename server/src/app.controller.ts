/* eslint-disable prettier/prettier */
import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';
import { freemem, totalmem } from 'os';
import { clearInterval } from 'timers';

@Controller()
export class AppController {
  private lastValue = 0;

  private longPollClients: Response[] = [];

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/time')
  getTime(): string {
    return Date.now().toString();
  }

  @Get('/long')
  getLong(@Res() response: Response): void {
    this.longPollClients.push(response);
  }

  @Get('/increment')
  getIncrement(): void {
    this.lastValue++;
    this.longPollClients.forEach((c) => {
      c.status(200).send(this.lastValue);
    });
    this.longPollClients = [];
  }

  @Get('/events')
  getEvents(@Res() response: Response, @Req() request : Request): void {
    response.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });

    const interval = setInterval(() => {
      response.write(
        `data: ${((totalmem() - freemem()) / 1024 / 1024 / 1024).toFixed(3)} GB / ${(totalmem() / 1024 / 1024 / 1024).toFixed(3)} GB\n\n`,
      );
    }, 1000);

    request.on('close', () => clearInterval(interval));
  }
}
