import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// componentes
import { MenuNavComponent } from './components/menu-nav/menu-nav.component';
import { HomeComponent } from './components/home/home.component';
import { NuevoRegistroComponent } from './components/nuevo-registro/nuevo-registro.component';
import { ListarRegistrosComponent } from './components/listar-registros/listar-registros.component';
import { BuscarRegistroComponent } from './components/buscar-registro/buscar-registro.component';
import { DetalleRegistroComponent } from './components/detalle-registro/detalle-registro.component';
import { ActualizarRegistroComponent } from './components/actualizar-registro/actualizar-registro.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuNavComponent,
    HomeComponent,
    NuevoRegistroComponent,
    ListarRegistrosComponent,
    BuscarRegistroComponent,
    DetalleRegistroComponent,
    ActualizarRegistroComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
