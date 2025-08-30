import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  version: string;
  timestamp: string;
  productCount: number;
  uptime: number;
}

@Injectable()
export class HealthService {
  constructor(private readonly productService: ProductService) {}

  /**
   * Get health check information
   * @returns Health check response with product count, message, and version
   */
  async getHealthCheck(): Promise<HealthCheckResponse> {
    try {
      // Get product count
      const productCount = await this.productService.getProductCount();

      // Get uptime in seconds
      const uptime = Math.floor(process.uptime());

      return {
        status: 'ok',
        message: 'Everything is working fine!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        productCount,
        uptime,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'مشکلی در سیستم وجود دارد',
        version: process.env.APP_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
        productCount: 0,
        uptime: Math.floor(process.uptime()),
      };
    }
  }

  /**
   * Get basic health status
   * @returns Simple health status
   */
  getBasicHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
