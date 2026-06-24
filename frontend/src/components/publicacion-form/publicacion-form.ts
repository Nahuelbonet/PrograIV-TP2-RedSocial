import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PublicacionesService } from '../../services/publicaciones';
import { AuthService } from '../../services/auth';
import { Boton } from '../boton/boton';

const MAX_TITULO = 35;
const MAX_DESCRIPCION = 150;

@Component({
  selector: 'app-publicacion-form',
  imports: [ReactiveFormsModule, Boton],
  templateUrl: './publicacion-form.html',
  styleUrl: './publicacion-form.scss',
})
export class PublicacionForm {
  private fb = inject(FormBuilder);
  private pubService = inject(PublicacionesService);
  private auth = inject(AuthService);

  // Avisa a la lista que se creó una publicación (para recargar)
  @Output() creada = new EventEmitter<void>();

  // Límites de caracteres (usados en el template para el contador y el maxlength)
  readonly maxTitulo = MAX_TITULO;
  readonly maxDescripcion = MAX_DESCRIPCION;

  imagenFile: File | null = null;
  imagenNombre = '';
  errorMsg = '';
  loading = false;
  abierto = false;

  form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(MAX_TITULO)]],
    descripcion: ['', [Validators.required, Validators.maxLength(MAX_DESCRIPCION)]],
  });

  get titulo() { return this.form.get('titulo')!; }
  get descripcion() { return this.form.get('descripcion')!; }

  toggle(): void {
    this.abierto = !this.abierto;
    if (!this.abierto) this.resetear();
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

    this.loading = true;
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
        this.creada.emit();
      },
      error: (err) => {
        const msg = err.error?.message;
        this.errorMsg = Array.isArray(msg)
          ? msg.join(' • ')
          : (msg || 'No se pudo crear la publicación.');
        this.loading = false;
      },
    });
  }

  private resetear(): void {
    this.form.reset();
    this.imagenFile = null;
    this.imagenNombre = '';
    this.errorMsg = '';
    this.loading = false;
  }
}
