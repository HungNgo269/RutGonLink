import { Injectable } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';

export type ErrorLogEntry = {
  timestamp: string;
  statusCode: number;
  errorName: string;
  message: string;
  method?: string;
  path?: string;
  stack?: string;
  details?: string;
};

@Injectable()
export class AppLoggerService {
  private readonly logFilePath = join(process.cwd(), 'logs', 'errors.log');

  async logError(entry: ErrorLogEntry): Promise<void> {
    await fs.mkdir(dirname(this.logFilePath), { recursive: true });
    await fs.appendFile(this.logFilePath, this.formatEntry(entry), 'utf8');
  }

  private formatEntry(entry: ErrorLogEntry): string {
    const lines = [
      '============================================================',
      `Time: ${entry.timestamp}`,
      `Status: ${entry.statusCode}`,
      `Error: ${entry.errorName}`,
      `Message: ${entry.message}`,
      `Method: ${entry.method ?? 'N/A'}`,
      `Path: ${entry.path ?? 'N/A'}`,
    ];

    if (entry.details) {
      lines.push(`Details: ${entry.details}`);
    }

    if (entry.stack) {
      lines.push('Stack:');
      lines.push(entry.stack);
    }

    lines.push('');

    return `${lines.join('\n')}\n`;
  }
}
