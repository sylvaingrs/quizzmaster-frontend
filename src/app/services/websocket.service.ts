import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { WsEvent } from '../models/models';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private readonly messages$ = new Subject<WsEvent>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentRoomId: string | null = null;

  connect(roomId: string): void {
    this.disconnect();
    this.currentRoomId = roomId;

    const url = `${environment.wsUrl}/room/${roomId}/ws`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsEvent;
        this.messages$.next(data);
      } catch {
        console.error('[WS] Failed to parse message:', event.data);
      }
    };

    this.ws.onclose = () => {
      if (this.currentRoomId) {
        this.reconnectTimer = setTimeout(() => {
          if (this.currentRoomId) {
            this.connect(this.currentRoomId);
          }
        }, 2000);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }

  disconnect(): void {
    this.currentRoomId = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  on<E extends WsEvent['event']>(
    eventName: E
  ): Observable<Extract<WsEvent, { event: E }>> {
    return this.messages$.pipe(
      filter((msg): msg is Extract<WsEvent, { event: E }> => msg.event === eventName)
    );
  }

  get allEvents$(): Observable<WsEvent> {
    return this.messages$.asObservable();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messages$.complete();
  }
}
