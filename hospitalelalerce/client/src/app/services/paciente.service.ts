import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { GLOBAL } from './global';
import { Paciente } from '../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  // URL base: usa la variable GLOBAL (ej: http://localhost:3000/api)
  private baseApi = GLOBAL.url.replace(/\/api\/?$/i, '');
  private url = `${this.baseApi}/api/pacientes`;
  private urlAll = `${this.baseApi}/api/pacientes/all`;

  constructor(private http: HttpClient) {}

  // reemplaza el método list()
  list(): Observable<Paciente[]> {
    return this.http.get<any>(this.url).pipe(
      map(res => {
        // aceptar array directo
        if (Array.isArray(res)) return res as Paciente[];

        // aceptar forma { ok: true, data: [...] }
        if (res && typeof res === 'object') {
          if (res.ok === false) {
            console.warn('[PacienteService] list() backend returned ok:false', res);
            return [];
          }
          if (Array.isArray(res.data)) return res.data as Paciente[];
          if (Array.isArray(res.pacientes)) return res.pacientes as Paciente[];
          if (Array.isArray(res.results)) return res.results as Paciente[];
        }
        return [];
      }),
      tap(data => console.log('[PacienteService] list() normalized length:', (data || []).length)),
      catchError(err => {
        console.error('[PacienteService] list() error:', err);
        return of([] as Paciente[]);
      })
    );
  }

  // reemplaza getById para aceptar { ok, data } o objeto directo
  getById(id: string): Observable<Paciente> {
    if (!id) return of({} as Paciente);
    return this.http.get<any>(`${this.url}/${id}`).pipe(
      map(res => {
        if (!res) return {} as Paciente;
        if (res && typeof res === 'object') {
          if (res.ok === false) {
            console.warn('[PacienteService] getById() backend returned ok:false', res);
            return {} as Paciente;
          }
          if (res.data && typeof res.data === 'object') return res.data as Paciente;
        }
        // si es objeto paciente directo
        return res as Paciente;
      }),
      tap(data => console.log('[PacienteService] getById() normalized:', data)),
      catchError(err => {
        console.error('[PacienteService] getById() error:', err);
        return of({} as Paciente);
      })
    );
  }

  create(paciente: Paciente): Observable<any> {
    return this.http.post(this.url, paciente).pipe(
      tap(res => console.log('[PacienteService] create() response:', res)),
      catchError(err => {
        console.error('[PacienteService] create() error:', err);
        return of(err);
      })
    );
  }

  update(id: string, paciente: Paciente): Observable<any> {
    return this.http.put(`${this.url}/${id}`, paciente).pipe(
      tap(res => console.log('[PacienteService] update() response:', res)),
      catchError(err => {
        console.error('[PacienteService] update() error:', err);
        return of(err);
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.url}/${id}`).pipe(
      tap(res => console.log('[PacienteService] delete() response:', res)),
      catchError(err => {
        console.error('[PacienteService] delete() error:', err);
        return of(err);
      })
    );
  }

  // reemplaza search() para aceptar varias formas de respuesta
  search(filters: { sexo?: string; fechaIngreso?: string; enfermedad?: string }): Observable<Paciente[]> {
    let params = new HttpParams();
    if (filters.sexo) params = params.set('sexo', filters.sexo);
    if (filters.fechaIngreso) params = params.set('fechaIngreso', filters.fechaIngreso);
    if (filters.enfermedad) params = params.set('enfermedad', filters.enfermedad);

    return this.http.get<any>(`${this.url}/search`, { params }).pipe(
      map(res => {
        if (Array.isArray(res)) return res as Paciente[];
        if (res && typeof res === 'object') {
          if (res.ok === false) {
            console.warn('[PacienteService] search() backend returned ok:false', res);
            return [];
          }
          if (Array.isArray(res.data)) return res.data as Paciente[];
          if (Array.isArray(res.pacientes)) return res.pacientes as Paciente[];
        }
        return [];
      }),
      tap(data => console.log('[PacienteService] search() normalized:', data.length)),
      catchError(err => {
        console.error('[PacienteService] search() error:', err);
        return of([] as Paciente[]);
      })
    );
  }

  getImageUrl(fotoPersonal?: string): string {
    const placeholder = 'https://via.placeholder.com/160x160.png?text=Paciente';
    if (!fotoPersonal) return placeholder;
    const isAbsolute = /^(https?:)?\/\//i.test(fotoPersonal);
    if (isAbsolute) return fotoPersonal;
    return `${this.baseApi}/uploads/${encodeURIComponent(fotoPersonal)}`;
  }
}
