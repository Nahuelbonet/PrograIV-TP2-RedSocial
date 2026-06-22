import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.scss',
})
export class EditarPerfil implements OnInit {
  @Input() usuario!: User;

  @Output() guardado = new EventEmitter<User>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  fotoFile: File | null = null;
  fotoNombre = '';
  errorMsg = '';
  loading = false;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [this.usuario.nombre, [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/)]],
      apellido: [this.usuario.apellido, [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/)]],
      fechaNacimiento: [this.usuario.fechaNacimiento?.slice(0, 10) ?? '', Validators.required],
      descripcion: [this.usuario.descripcion ?? ''],
    });
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
    this.loading = true;
    this.errorMsg = '';

    const { nombre, apellido, fechaNacimiento, descripcion } = this.form.value;
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('fechaNacimiento', fechaNacimiento);
    formData.append('descripcion', descripcion ?? '');
    if (this.fotoFile) formData.append('fotoPerfil', this.fotoFile);

    this.auth.actualizarPerfil(this.usuario._id, formData).subscribe({
      next: (user) => this.guardado.emit(user),
      error: (err) => {
        const msg = err.error?.message;
        this.errorMsg = Array.isArray(msg)
          ? msg.join(' • ')
          : (msg || 'No se pudo actualizar el perfil.');
        this.loading = false;
      },
    });
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
