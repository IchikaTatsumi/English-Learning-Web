import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './core/decorators/public.decorator';

@ApiTags('Root')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get API root information' })
  @ApiResponse({
    status: 200,
    description: 'API root endpoint',
    schema: {
      example: {
        message: 'Welcome to English Learning API v1.0',
        version: '1.0.0',
        docs: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          vocabularies: '/api/vocabularies',
          topics: '/api/topics',
          quiz: '/api/quiz',
          progress: '/api/progress',
        },
      },
    },
  })
  getRoot() {
    return {
      message: 'Welcome to English Learning API v1.0',
      version: '1.0.0',
      docs: '/api/docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        vocabularies: '/api/vocabularies',
        topics: '/api/topics',
        quiz: '/api/quiz',
        progress: '/api/progress',
        results: '/api/results',
        speech: '/api/speech',
      },
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // Có thể check connection thực tế
    };
  }
}
