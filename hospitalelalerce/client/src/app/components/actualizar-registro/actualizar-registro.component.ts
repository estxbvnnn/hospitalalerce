import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-actualizar-registro',
  templateUrl: './actualizar-registro.component.html'
})
export class ActualizarRegistroComponent implements OnInit {
  model: Partial<Paciente> = {};
  loading = true;
  id = '';
  constructor(private route: ActivatedRoute, private pacienteService: PacienteService, private router: Router) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.pacienteService.getById(this.id).subscribe({
        next: (p) => { this.model = p; this.loading = false; },
        error: () => this.loading = false
      });
    } else this.loading = false;
  }

  submit() {
    const { rut, nombre, edad, sexo, enfermedad } = this.model as any;
    if (!rut || !nombre || !edad || !sexo || !enfermedad) {
      alert('Complete todos los campos obligatorios: rut, nombre, edad, sexo, enfermedad');
      return;
    }
    this.pacienteService.update(this.id, this.model as Paciente).subscribe({
      next: () => this.router.navigate(['/listar-registros']),
      error: (err) => alert('Error al actualizar: ' + (err.message || err))
    });
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { alert('Archivo excede 20MB'); return; }
      this.model.fotoPersonal = file.name;
    }
  }
}
