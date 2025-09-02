export interface Paciente {
  rut: string;
  nombre: string;
  edad: number;
  sexo: string;
  fotoPersonal?: string;
  fechaIngreso?: string;
  enfermedad: string;
  revisado?: boolean;
  _id?: string;
}
