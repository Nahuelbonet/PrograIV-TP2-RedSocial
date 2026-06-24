import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { PublicacionesService } from '../../../services/publicaciones';
import { User } from '../../../models/user.model';
import { Publicacion } from '../../../models/publicacion.model';
import { Boton } from '../../../components/boton/boton';
import { PublicacionCard } from '../../../components/publicacion-card/publicacion-card';

@Component({
  selector: 'app-mi-perfil-page',
  imports: [RouterLink, ReactiveFormsModule, Boton, PublicacionCard],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.scss',
})
export class MiPerfilPage implements OnInit {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private pubService = inject(PublicacionesService);

  usuario: User | null = null;

  // ── Mis últimas publicaciones ──
  publicaciones: Publicacion[] = [];
  cargandoPublicaciones = false;
  errorPublicaciones = '';

  // ── Edición de perfil ──
  editando = false;
  form!: FormGroup;
  fotoFile: File | null = null;
  fotoNombre = '';
  guardando = false;
  errorEdicion = '';

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();
    this.cargarPublicaciones();
  }

  // ── Datos de cuenta ──
  formatFecha(fecha: string): string {
    return fecha?.slice(0, 10) ?? '';
  }

  // ── Mis publicaciones ──
  private cargarPublicaciones(): void {
    if (!this.usuario?._id) return;
    this.cargandoPublicaciones = true;
    // Últimas 3 publicaciones del usuario, ordenadas por fecha
    this.pubService
      .listar({ usuarioId: this.usuario._id, orden: 'fecha', limit: 3 })
      .subscribe({
        next: (res) => {
          this.publicaciones = res.publicaciones;
          this.cargandoPublicaciones = false;
        },
        error: () => {
          this.errorPublicaciones = 'No se pudieron cargar tus publicaciones.';
          this.cargandoPublicaciones = false;
        },
      });
  }

  // ── Edición de perfil ──
  abrirEdicion(): void {
    if (!this.usuario) return;
    this.form = this.fb.group({
      nombre: [this.usuario.nombre, [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/)]],
      apellido: [this.usuario.apellido, [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/)]],
      fechaNacimiento: [this.usuario.fechaNacimiento?.slice(0, 10) ?? '', Validators.required],
      descripcion: [this.usuario.descripcion ?? ''],
    });
    this.fotoFile = null;
    this.fotoNombre = '';
    this.errorEdicion = '';
    this.editando = true;
  }

  get nombre() { return this.form.get('nombre')!; }
  get apellido() { return this.form.get('apellido')!; }
  get fechaNacimiento() { return this.form.get('fechaNacimiento')!; }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fotoFile = input.files[0];
      this.fotoNombre = this.fotoFile.name;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.usuario) return;
    this.guardando = true;
    this.errorEdicion = '';

    const { nombre, apellido, fechaNacimiento, descripcion } = this.form.value;
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('fechaNacimiento', fechaNacimiento);
    formData.append('descripcion', descripcion ?? '');
    if (this.fotoFile) formData.append('fotoPerfil', this.fotoFile);

    this.auth.actualizarPerfil(this.usuario._id, formData).subscribe({
      next: (user) => {
        this.usuario = user; // refresca los datos mostrados
        this.editando = false;
        this.guardando = false;
      },
      error: (err) => {
        const msg = err.error?.message;
        this.errorEdicion = Array.isArray(msg)
          ? msg.join(' • ')
          : (msg || 'No se pudo actualizar el perfil.');
        this.guardando = false;
      },
    });
  }

  cerrarEdicion(): void {
    this.editando = false;
  }
}
