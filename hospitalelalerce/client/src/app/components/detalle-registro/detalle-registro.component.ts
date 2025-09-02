import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-detalle-registro',
  templateUrl: './detalle-registro.component.html'
})
export class DetalleRegistroComponent implements OnInit {
  paciente?: Paciente;
  loading = true;
  constructor(private route: ActivatedRoute, public pacienteService: PacienteService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.pacienteService.getById(id).subscribe({
        next: (p) => { this.paciente = p; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else this.loading = false;
  }

  eliminar() {
    if (!this.paciente?._id) return;
    if (!confirm('¿Eliminar registro?')) return;
    this.pacienteService.delete(this.paciente._id).subscribe({
      next: () => this.router.navigate(['/listar-registros']),
      error: (err) => alert('Error: ' + (err.message || err))
    });
  }
}
