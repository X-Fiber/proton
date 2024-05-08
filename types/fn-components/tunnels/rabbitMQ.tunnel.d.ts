export interface IRabbitMQTunnel {
  sendToQueue(queue: string, data: any): void;
}

export interface NRabbitMQTunnel {}
