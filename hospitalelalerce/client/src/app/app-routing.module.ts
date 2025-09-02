import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NuevoRegistroComponent } from './components/nuevo-registro/nuevo-registro.component';
import { ListarRegistrosComponent } from './components/listar-registros/listar-registros.component';
import { BuscarRegistroComponent } from './components/buscar-registro/buscar-registro.component';
import { DetalleRegistroComponent } from './components/detalle-registro/detalle-registro.component';
import { ActualizarRegistroComponent } from './components/actualizar-registro/actualizar-registro.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'nuevo-registro', component: NuevoRegistroComponent },
  { path: 'listar-registros', component: ListarRegistrosComponent },
  { path: 'buscar-registro', component: BuscarRegistroComponent },
  { path: 'detalle/:id', component: DetalleRegistroComponent },
  { path: 'actualizar/:id', component: ActualizarRegistroComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
