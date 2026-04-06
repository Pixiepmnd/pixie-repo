/**
 * Metrics collection for monitoring
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export class MetricsCollector {
  private metrics: Metric[] = [];

  /**
   * Record a metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      tags,
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string): Metric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get average value for metric
   */
  getAverage(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get metric count
   */
  getCount(name: string): number {
    return this.getMetrics(name).length;
  }
}

// Global metrics instance
export const metrics = new MetricsCollector();
