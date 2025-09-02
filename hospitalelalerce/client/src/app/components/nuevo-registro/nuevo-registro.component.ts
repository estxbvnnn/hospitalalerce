import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-nuevo-registro',
  templateUrl: './nuevo-registro.component.html'
})
export class NuevoRegistroComponent {
  model: Partial<Paciente> = {};
  constructor(private pacienteService: PacienteService, private router: Router) {}

  submit() {
    const { rut, nombre, edad, sexo, enfermedad } = this.model as any;
    if (!rut || !nombre || !edad || !sexo || !enfermedad) {
      alert('Complete todos los campos obligatorios: rut, nombre, edad, sexo, enfermedad');
      return;
    }
    this.model.fechaIngreso = new Date().toISOString();
    this.model.revisado = false;
    this.pacienteService.create(this.model as Paciente).subscribe({
      next: () => {
        // Tras crear, forzamos la recarga de la lista para asegurar que el nuevo registro aparezca
        this.pacienteService.list().subscribe({
          next: (data) => {
            console.log('Lista de pacientes tras crear:', data);
            this.router.navigate(['/listar-registros']);
          },
          error: (err) => {
            console.warn('No se pudo cargar la lista tras crear (pero creación pudo haber sido exitosa):', err);
            // Navegar de todas formas para que el componente listar intente su propia carga
            this.router.navigate(['/listar-registros']);
          }
        });
      },
      error: (err) => alert('Error al crear: ' + (err.message || err))
    });
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { alert('Archivo excede 20MB'); return; }
      this.model.fotoPersonal = file.name; // en flujo real subir y obtener URL
    }
  }
}
