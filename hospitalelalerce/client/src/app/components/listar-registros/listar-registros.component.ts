import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-listar-registros',
  templateUrl: './listar-registros.component.html'
})
export class ListarRegistrosComponent implements OnInit, OnDestroy {
  pacientes: Paciente[] = [];
  loading = true;
  private routerSub?: Subscription;

  // filtros (similar a React)
  filters = {
    q: '',
    edad: '',
    sexo: '',
    ordenar: 'nombre-asc'
  };

  constructor(public pacienteService: PacienteService, private router: Router) {}

  ngOnInit(): void {
    this.load();

    // recargar la lista cuando haya una navegación que termine (útil si se navega desde NuevoRegistro)
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        // opcional: comprobar la URL para evitar recargas innecesarias
        if ((event as NavigationEnd).urlAfterRedirects.includes('/listar-registros')) {
          this.load();
        }
      });
  }

  // nuevo método para (re)cargar datos desde la API
  load() {
    this.loading = true;
    this.pacienteService.list().subscribe({
      next: (data) => {
        console.log('[ListarRegistros] load() raw data:', data);
        const arr = Array.isArray(data) ? data : [];
        this.pacientes = arr.map(p => {
          if ((p as any)?._id && typeof (p as any)._id !== 'string') {
            (p as any)._id = String((p as any)._id);
          }
          return p;
        });
        console.log('[ListarRegistros] pacientes count:', this.pacientes.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        this.pacientes = [];
        this.loading = false;
        alert('Error cargando pacientes. Revisa la consola y que el backend esté corriendo.');
      }
    });
  }

  borrar(id?: string) {
    if (!id) return;
    if (!confirm('¿Eliminar registro?')) return;
    this.pacienteService.delete(id).subscribe({
      next: () => {
        // actualizar la lista local sin necesidad de volver a pedirla al servidor
        this.pacientes = this.pacientes.filter(p => p._id !== id);
      },
      error: (err) => alert('Error: ' + (err.message || err))
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  // handlers de filtros (usados por template)
  onChangeField(name: string, value: string) {
    (this.filters as any)[name] = value;
  }

  onClear() {
    this.filters = { q: '', edad: '', sexo: '', ordenar: 'nombre-asc' };
  }

  onSubmit(event: Event) {
    event.preventDefault();
    // la lista se renderiza automáticamente desde get filtered()
  }

  // propiedad calculada para filtros y ordenamiento (similar a useMemo)
  get filtered(): Paciente[] {
    const f = this.filters;
    const arr = Array.isArray(this.pacientes) ? this.pacientes.slice() : [];

    const filtered = arr.filter(r => {
      const q = (f.q || '').trim().toLowerCase();
      const matchQ = q
        ? ((r.nombre || '').toLowerCase().includes(q)
          || (r.rut || '').toLowerCase().includes(q)
          || (r.enfermedad || '').toLowerCase().includes(q))
        : true;

      const matchSexo = f.sexo ? (r.sexo === f.sexo) : true;

      const matchEdad = f.edad ? (() => {
        const [min, max] = (f.edad || '').split('-');
        const n = Number(r.edad || 0);
        if (max === '+' || max === '+') return n >= Number(min);
        return n >= Number(min) && n <= Number(max);
      })() : true;

      return matchQ && matchSexo && matchEdad;
    });

    filtered.sort((a, b) => {
      switch (this.filters.ordenar) {
        case 'nombre-asc': return (a.nombre || '').localeCompare(b.nombre || '');
        case 'nombre-desc': return (b.nombre || '').localeCompare(a.nombre || '');
        case 'edad-asc': return (Number(a.edad || 0) - Number(b.edad || 0));
        case 'edad-desc': return (Number(b.edad || 0) - Number(a.edad || 0));
        default: return 0;
      }
    });

    return filtered;
  }
}
