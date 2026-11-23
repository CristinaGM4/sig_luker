import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionIdentity } from './contracts';
@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private bearer = signal('');
  readonly identity = signal<SessionIdentity | null>(null);
  token() {
    return this.bearer();
  }
  setPendingToken(token: string) {
    this.clear();
    this.bearer.set(token.trim());
  }
  verify() {
    return this.http.get<SessionIdentity>('/api/v1/auth/me');
  }
  clear() {
    this.bearer.set('');
    this.identity.set(null);
  }
  revoke() {
    return this.http.delete<void>('/api/v1/auth/session');
  }
  canRead() {
    return this.identity()?.permissions.includes('records:read') ?? false;
  }
}
