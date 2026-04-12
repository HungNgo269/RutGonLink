import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Read API health text.' })
  @ApiOkResponse({ schema: { example: 'Hello World!' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
