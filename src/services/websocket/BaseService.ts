import { WebSocketConnection } from './WebSocketConnection';

/**
 * Base class cho tất cả WebSocket services
 * Provides common functionality như sendAndWaitForResponse
 */
export abstract class BaseService {
    constructor(protected connection: WebSocketConnection) {}

    /**
     * Send message và đợi response với timeout
     * Generic type T = expected response type
     */
    protected async sendAndWaitForResponse<T = any>(
        event: string,
        data: any,
        timeout = 10000
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.connection.off(event, handleResponse);
                reject(new Error(`${event} timeout after ${timeout}ms`));
            }, timeout);

            const handleResponse = (response: any) => {
                clearTimeout(timeoutId);
                this.connection.off(event, handleResponse);

                // Standardized error handling
                if (response.status === 'success') {
                    resolve(response.data as T);
                } else {
                    const errorMessage = response.mes
                        || response.message
                        || response.error
                        || `${event} failed`;
                    reject(new Error(errorMessage));
                }
            };

            // Register handler
            this.connection.on(event, handleResponse);

            // Send request
            this.connection.send({
                action: 'onchat',
                data: {
                    event: event,
                    data: data
                }
            }).catch((err) => {
                clearTimeout(timeoutId);
                this.connection.off(event, handleResponse);
                reject(err);
            });
        });
    }

    /**
     * Send fire-and-forget message (no response expected)
     */
    protected async send(event: string, data: any): Promise<void> {
        return this.connection.send({
            action: 'onchat',
            data: { event, data }
        });
    }
}