declare module ws {
  export class WebSocket extends ws.WebSocket {
    public uuid: string;
  }
}
