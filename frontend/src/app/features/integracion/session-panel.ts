import { Component, OnDestroy, inject, isDevMode, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SessionService } from '../../core/api/session.service';
import { apiErrorMessage } from '../../core/api/pagination';
@Component({
  selector: 'app-session-panel',
  imports: [ReactiveFormsModule],
  template: `@if (dev) {
    <details class="connection-panel">
      <summary>
        Sesión interna de desarrollo
        <span>{{ session.identity() ? 'Verificada' : 'Sin sesión' }}</span>
      </summary>
      <p>
        Usa el token temporal que entrega el backend de Mate. Se conserva en memoria durante esta
        apertura.
      </p>
      @if (!session.identity()) {
        <form [formGroup]="form" (ngSubmit)="connect()">
          <label
            >Token temporal<input
              type="password"
              autocomplete="off"
              formControlName="token" /></label
          ><button class="button" [disabled]="token.invalid || busy()">
            {{ busy() ? 'Verificando…' : 'Conectar sesión' }}
          </button>
        </form>
      } @else {
        <p>
          Sesión verificada ·
          {{
            session.canRead()
              ? 'Consulta institucional habilitada'
              : 'Sin permiso de consulta institucional'
          }}
        </p>
        <button type="button" class="button secondary" [disabled]="busy()" (click)="disconnect()">
          Cerrar sesión
        </button>
      }
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
    </details>
  }`,
})
export class SessionPanelComponent implements OnDestroy {
  session = inject(SessionService);
  dev = isDevMode();
  token = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S+/)],
  });
  form = new FormGroup({ token: this.token });
  busy = signal(false);
  error = signal('');
  private request?: Subscription;
  connect() {
    if (this.token.invalid || this.busy()) return;
    this.error.set('');
    this.busy.set(true);
    this.session.setPendingToken(this.token.value);
    this.token.reset();
    this.request = this.session.verify().subscribe({
      next: (identity) => {
        this.session.identity.set(identity);
        this.busy.set(false);
      },
      error: (e) => {
        this.session.clear();
        this.error.set(apiErrorMessage(e.status));
        this.busy.set(false);
      },
    });
  }
  disconnect() {
    this.busy.set(true);
    this.error.set('');
    this.request = this.session.revoke().subscribe({
      next: () => {
        this.session.clear();
        this.busy.set(false);
      },
      error: (e) => {
        this.session.clear();
        this.error.set(apiErrorMessage(e.status));
        this.busy.set(false);
      },
    });
  }
  ngOnDestroy() {
    this.request?.unsubscribe();
  }
}
