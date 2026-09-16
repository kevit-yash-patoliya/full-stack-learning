import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('USER_SERVICE') private readonly userClient: ClientProxy) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('user')
  getUser() {
    return this.userClient.emit('user_created', { name: 'John Doe', email: 'john.doe@example.com' });
  }
}
