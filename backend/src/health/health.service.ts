import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private dataSource: DataSource) {}

  async check() {
    let database: 'connected' | 'error' = 'connected';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'error';
    }

    return {
      status: database === 'connected' ? 'ok' : 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
