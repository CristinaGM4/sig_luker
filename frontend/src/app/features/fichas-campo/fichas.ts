import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { FichaCampo, HallazgoTerritorial } from '../../core/models';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/ui';
@Component({
  selector: 'app-fichas',
  imports: [FormsModule, PageHeaderComponent, EmptyStateComponent],
  template: `<app-page-header
      title="Fichas de campo"
      description="Registro de sesiones y hallazgos territoriales de demostración"
    />
    <div class="notice">
      Protección de datos: no ingresar nombres ni relatos personales identificables. Los registros
      se guardan solo en memoria y se pierden al recargar.
    </div>
    <div class="section-line">
      <h2>
        Sesiones registradas <span class="chip">{{ data.fichas().length }}</span>
      </h2>
      <button class="button" (click)="show = true; saved = false">+ Nueva ficha</button>
    </div>
    @if (saved) {
      <div class="success" role="status">
        Ficha DEMO guardada en memoria. No se enviaron datos a servidores.
      </div>
    }
    @if (show) {
      <form class="card form-card" #form="ngForm" (ngSubmit)="guardar(form.valid === true)">
        <div class="card-heading">
          <h2>Nueva ficha · DEMO</h2>
          <button type="button" class="text-button" (click)="show = false">Cerrar ✕</button>
        </div>
        <div class="form-grid">
          <label
            >Institución *<select
              name="institucion"
              required
              [(ngModel)]="draft.institucionId"
              (ngModelChange)="draft.sedeId = ''"
            >
              <option value="">Seleccionar institución</option>
              @for (i of data.instituciones; track i.id) {
                <option [value]="i.id">{{ i.nombre }}</option>
              }
            </select></label
          ><label
            >Sede de demostración *<select name="sede" required [(ngModel)]="draft.sedeId">
              <option value="">Seleccionar sede</option>
              @for (s of sedes; track s.id) {
                <option [value]="s.id">{{ s.nombre }}</option>
              }
            </select></label
          ><label
            >Fecha *<input name="fecha" type="date" required [(ngModel)]="draft.fecha" /></label
          ><label
            >Tipo de sesión *<select name="tipo" required [(ngModel)]="draft.tipo">
              <option value="">Seleccionar componente</option>
              <option>Recorrido territorial</option>
              <option>Taller de bienestar</option>
              <option>Observación de infraestructura</option>
            </select></label
          ><label
            >Código de sesión *<input
              name="codigo"
              required
              pattern="[A-Za-z0-9-]{3,30}"
              [(ngModel)]="draft.codigo"
              placeholder="DEMO-001" /></label
          ><label class="full"
            >Observaciones generales<textarea
              name="observaciones"
              maxlength="1500"
              [(ngModel)]="draft.observaciones"
              placeholder="Describir únicamente condiciones agregadas y no identificables"
            ></textarea>
          </label>
        </div>
        <div class="section-line">
          <h3>Hallazgos</h3>
          <button type="button" class="button secondary" (click)="addHallazgo()">
            + Agregar hallazgo
          </button>
        </div>
        @for (h of draft.hallazgos; track $index; let ix = $index) {
          <div class="finding">
            <div class="section-line">
              <b>{{ h.codigo }} · Hallazgo DEMO</b
              ><button type="button" class="text-button" (click)="draft.hallazgos.splice(ix, 1)">
                Eliminar
              </button>
            </div>
            <div class="form-grid">
              <label
                >Descripción *<input
                  [name]="'desc' + ix"
                  required
                  maxlength="1000"
                  [(ngModel)]="h.descripcion" /></label
              ><label
                >Categoría *<select [name]="'cat' + ix" required [(ngModel)]="h.categoria">
                  <option value="">Seleccionar</option>
                  <option>Factor protector</option>
                  <option>Condición territorial</option>
                  <option>Infraestructura</option>
                </select></label
              ><label
                >Lugar relacionado *<input
                  [name]="'lugar' + ix"
                  required
                  pattern="L[0-9]{3}"
                  [(ngModel)]="h.lugar" /></label
              ><label
                >Fuente *<input
                  [name]="'fuente' + ix"
                  required
                  [(ngModel)]="h.fuente"
                  placeholder="Observación de campo DEMO"
              /></label>
            </div>
          </div>
        }
        @if (error) {
          <p class="error" role="alert">{{ error }}</p>
        }
        <div class="form-actions">
          <small
            >* Campos obligatorios. Código de sesión único, de 3 a 30 letras, números o
            guiones.</small
          ><button class="button" type="submit" [disabled]="form.invalid">
            Guardar ficha DEMO
          </button>
        </div>
      </form>
    }
    <section class="card">
      @if (data.fichas().length) {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código de sesión</th>
                <th>Fecha</th>
                <th>Institución</th>
                <th>Componente</th>
                <th>Hallazgos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (f of data.fichas(); track f.codigo) {
                <tr>
                  <td class="strong">{{ f.codigo }}</td>
                  <td>{{ f.fecha }}</td>
                  <td>{{ data.nombre(f.institucionId) }}</td>
                  <td>{{ f.tipo }}</td>
                  <td>{{ f.hallazgos.length }}</td>
                  <td>
                    <span class="chip">{{ f.estado }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <app-empty-state
          title="Aún no hay sesiones registradas"
          description="Crea una ficha para explorar el registro en memoria de este prototipo."
        />
      }
    </section>`,
})
export class FichasComponent {
  data = inject(DataService);
  show = false;
  saved = false;
  error = '';
  draft = this.blank();
  blank(): FichaCampo {
    return {
      codigo: '',
      fecha: '',
      institucionId: '',
      sedeId: '',
      tipo: '',
      observaciones: '',
      hallazgos: [],
      estado: 'DEMO · en memoria',
    };
  }
  get sedes() {
    return this.data.sedes.filter((s) => s.institucionId === this.draft.institucionId);
  }
  addHallazgo() {
    let n = 1;
    while (this.draft.hallazgos.some((h) => h.codigo === 'H' + String(n).padStart(3, '0'))) n++;
    this.draft.hallazgos.push({
      codigo: 'H' + String(n).padStart(3, '0'),
      descripcion: '',
      categoria: '',
      lugar: 'L001',
      fuente: '',
    });
  }
  guardar(valid: boolean) {
    if (!valid) return;
    if (
      this.data.fichas().some((f) => f.codigo.toLowerCase() === this.draft.codigo.toLowerCase())
    ) {
      this.error = 'El código de sesión ya existe. Usa un código único.';
      return;
    }
    this.data.agregar(structuredClone(this.draft));
    this.draft = this.blank();
    this.show = false;
    this.saved = true;
    this.error = '';
  }
}
