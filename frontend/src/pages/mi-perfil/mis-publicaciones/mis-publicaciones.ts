import { Component, Input, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PublicacionesService } from '../../../services/publicaciones';
import { Publicacion } from '../../../models/publicacion.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-mis-publicaciones',
  imports: [DatePipe],
  templateUrl: './mis-publicaciones.html',
  styleUrl: './mis-publicaciones.scss',
})
export class MisPublicaciones implements OnInit {
  @Input() usuario!: User;

  private pubService = inject(PublicacionesService);

  publicaciones: Publicacion[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    if (!this.usuario?._id) return;
    this.loading = true;
    // Últimas 3 publicaciones del usuario, ordenadas por fecha
    this.pubService
      .listar({ usuarioId: this.usuario._id, orden: 'fecha', limit: 3 })
      .subscribe({
        next: (res) => {
          this.publicaciones = res.publicaciones;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar tus publicaciones.';
          this.loading = false;
        },
      });
  }

  nombreAutorComentario(usuario: { nombre: string; apellido: string } | null): string {
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario';
  }
}
