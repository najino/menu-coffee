import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthCheckResponse } from './health.service';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Get detailed health check information
   * @returns Health check response with product count, message, and version
   */
  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description:
      'Get detailed health check information including product count, message, and version',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    type: Object,
    schema: {
      example: {
        status: 'ok',
        message: 'سایت کافه منو در حال کار است و همه چیز خوب پیش می‌رود! ☕',
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        productCount: 25,
        uptime: 3600,
      },
    },
  })
  async getHealthCheck(): Promise<HealthCheckResponse> {
    return this.healthService.getHealthCheck();
  }

  /**
   * Get basic health status
   * @returns Simple health status
   */
  @Get('ping')
  @ApiOperation({
    summary: 'Ping Health Check',
    description: 'Get basic health status for load balancers and monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Basic health check successful',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  getBasicHealth() {
    return this.healthService.getBasicHealth();
  }
}
