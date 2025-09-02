import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  ultimos: Paciente[] = [];
  loading = true;
  constructor(public pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.pacienteService.list().subscribe({
      next: (data) => {
        const arr = Array.isArray(data) ? data : [];
        this.ultimos = arr.slice(-5).reverse();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
