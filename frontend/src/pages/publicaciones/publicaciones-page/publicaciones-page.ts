import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PublicacionCard } from '../../../components/publicacion-card/publicacion-card';
import { Boton } from '../../../components/boton/boton';
import { PublicacionesService } from '../../../services/publicaciones';
import { AuthService } from '../../../services/auth';
import { AutofocusDirective } from '../../../directives/autofocus.directive';
import { ResaltarDirective } from '../../../directives/resaltar.directive';
import { ClickAfueraDirective } from '../../../directives/click-afuera.directive';
import {
  OrdenPublicaciones,
  Publicacion,
} from '../../../models/publicacion.model';

const LIMIT = 5; // publicaciones por página
const MAX_TITULO = 35;
const MAX_DESCRIPCION = 150;

@Component({
  selector: 'app-publicaciones-page',
  imports: [
    PublicacionCard,
    Boton,
    ReactiveFormsModule,
    AutofocusDirective,
    ResaltarDirective,
    ClickAfueraDirective,
  ],
  templateUrl: './publicaciones-page.html',
  styleUrl: './publicaciones-page.scss',
})
export class PublicacionesPage implements OnInit {
  private pubService = inject(PublicacionesService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  // ── Listado ──
  publicaciones: Publicacion[] = [];
  total = 0;
  orden: OrdenPublicaciones = 'fecha';
  offset = 0;
  readonly limit = LIMIT;
  loading = false;
  error = '';

  usuarioActualId = this.auth.getUsuario()?._id ?? '';
  esAdmin = this.auth.getUsuario()?.perfil === 'administrador';

  // ── Formulario de creación ──
  readonly maxTitulo = MAX_TITULO;
  readonly maxDescripcion = MAX_DESCRIPCION;
  imagenFile: File | null = null;
  imagenNombre = '';
  errorMsg = '';
  publicando = false;
  abierto = false;

  form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(MAX_TITULO)]],
    descripcion: ['', [Validators.required, Validators.maxLength(MAX_DESCRIPCION)]],
  });

  get titulo() { return this.form.get('titulo')!; }
  get descripcion() { return this.form.get('descripcion')!; }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.pubService
      .listar({ orden: this.orden, offset: this.offset, limit: this.limit })
      .subscribe({
        next: (res) => {
          this.publicaciones = res.publicaciones;
          this.total = res.total;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar las publicaciones.';
          this.loading = false;
        },
      });
  }

  cambiarOrden(orden: OrdenPublicaciones): void {
    if (this.orden === orden) return;
    this.orden = orden;
    this.offset = 0; // volvemos a la primera página
    this.cargar();
  }

  // ── Paginación ──────────────────────────────────────
  get paginaActual(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get hayAnterior(): boolean {
    return this.offset > 0;
  }

  get haySiguiente(): boolean {
    return this.offset + this.limit < this.total;
  }

  anterior(): void {
    if (!this.hayAnterior) return;
    this.offset = Math.max(0, this.offset - this.limit);
    this.cargar();
  }

  siguiente(): void {
    if (!this.haySiguiente) return;
    this.offset += this.limit;
    this.cargar();
  }

  // ── Me gusta ────────────────────────────────────────
  onToggleLike(pub: Publicacion): void {
    if (!this.usuarioActualId) return;
    const yaDioLike = pub.likes.includes(this.usuarioActualId);
    const accion = yaDioLike
      ? this.pubService.quitarLike(pub._id, this.usuarioActualId)
      : this.pubService.darLike(pub._id, this.usuarioActualId);

    accion.subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: () => (this.error = 'No se pudo actualizar el me gusta.'),
    });
  }

  // ── Eliminar (baja lógica) ──────────────────────────
  onEliminar(pub: Publicacion): void {
    if (!this.usuarioActualId) return;
    this.pubService.eliminar(pub._id, this.usuarioActualId).subscribe({
      next: () => {
        // Si la página queda vacía y no es la primera, retrocedemos una
        if (this.publicaciones.length === 1 && this.offset >= this.limit) {
          this.offset -= this.limit;
        }
        this.cargar();
      },
      error: () => (this.error = 'No se pudo eliminar la publicación.'),
    });
  }

  private reemplazar(actualizada: Publicacion): void {
    const i = this.publicaciones.findIndex((p) => p._id === actualizada._id);
    if (i !== -1) this.publicaciones[i] = actualizada;
  }

  // ── Crear publicación ───────────────────────────────
  toggle(): void {
    this.abierto = !this.abierto;
    if (!this.abierto) this.resetear();
  }

  // Si el formulario está abierto y se hace clic afuera, lo cerramos
  alClickAfuera(): void {
    if (this.abierto) {
      this.abierto = false;
      this.resetear();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagenFile = input.files[0];
      this.imagenNombre = this.imagenFile.name;
    }
  }

  quitarImagen(): void {
    this.imagenFile = null;
    this.imagenNombre = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const usuarioId = this.auth.getUsuario()?._id;
    if (!usuarioId) {
      this.errorMsg = 'Debés iniciar sesión para publicar.';
      return;
    }

    this.publicando = true;
    this.errorMsg = '';

    const formData = new FormData();
    formData.append('titulo', this.titulo.value);
    formData.append('descripcion', this.descripcion.value);
    formData.append('usuarioId', usuarioId);
    if (this.imagenFile) formData.append('imagen', this.imagenFile);

    this.pubService.crear(formData).subscribe({
      next: () => {
        this.resetear();
        this.abierto = false;
        // Tras crear: volvemos a la primera página por fecha
        this.orden = 'fecha';
        this.offset = 0;
        this.cargar();
      },
      error: (err) => {
        const msg = err.error?.message;
        this.errorMsg = Array.isArray(msg)
          ? msg.join(' • ')
          : (msg || 'No se pudo crear la publicación.');
        this.publicando = false;
      },
    });
  }

  private resetear(): void {
    this.form.reset();
    this.imagenFile = null;
    this.imagenNombre = '';
    this.errorMsg = '';
    this.publicando = false;
  }
}
