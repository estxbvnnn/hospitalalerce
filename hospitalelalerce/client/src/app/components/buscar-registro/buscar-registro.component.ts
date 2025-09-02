import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-buscar-registro',
  templateUrl: './buscar-registro.component.html'
})
export class BuscarRegistroComponent implements OnInit {
  sexo = '';
  fechaIngreso = '';
  enfermedad = '';
  resultados: Paciente[] = [];
  loading = false;
  constructor(public pacienteService: PacienteService) {}

  ngOnInit(): void {}

  buscar() {
    this.loading = true;
    this.pacienteService.search({ sexo: this.sexo, fechaIngreso: this.fechaIngreso, enfermedad: this.enfermedad }).subscribe({
      next: (data) => { this.resultados = data; this.loading = false; },
      error: () => { this.resultados = []; this.loading = false; }
    });
  }
}
