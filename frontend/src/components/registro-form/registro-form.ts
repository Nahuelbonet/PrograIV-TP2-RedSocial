import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SesionService } from '../../services/sesion.service';
import { Boton } from '../boton/boton';

function passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('repetirPassword')?.value;
  return pass === confirm ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-registro-form',
  imports: [ReactiveFormsModule, RouterLink, Boton],
  templateUrl: './registro-form.html',
  styleUrl: './registro-form.scss',
})
export class RegistroForm {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private sesion = inject(SesionService);
  private router = inject(Router);

  fotoFile: File | null = null;
  errorMsg = '';
  loading = false;

  form: FormGroup = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: [''],
      perfil: ['usuario'],
    },
    { validators: passwordsCoinciden }
  );

  get nombre() { return this.form.get('nombre')!; }
  get apellido() { return this.form.get('apellido')!; }
  get correo() { return this.form.get('correo')!; }
  get nombreUsuario() { return this.form.get('nombreUsuario')!; }
  get password() { return this.form.get('password')!; }
  get repetirPassword() { return this.form.get('repetirPassword')!; }
  get fechaNacimiento() { return this.form.get('fechaNacimiento')!; }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fotoFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const { nombre, apellido, correo, nombreUsuario, password, fechaNacimiento, descripcion, perfil } =
      this.form.value;

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('correo', correo);
    formData.append('nombreUsuario', nombreUsuario);
    formData.append('password', password);
    formData.append('fechaNacimiento', fechaNacimiento);
    formData.append('descripcion', descripcion || '');
    formData.append('perfil', perfil);
    if (this.fotoFile) formData.append('fotoPerfil', this.fotoFile);

    this.auth.register(formData).subscribe({
      next: () => {
        this.loading = false;
        this.sesion.iniciarContador();
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        const msg = err.error?.message;
        this.errorMsg = Array.isArray(msg)
          ? msg.join(' • ')
          : (msg || 'Error al registrarse. Intentá de nuevo.');
        this.loading = false;
      },
    });
  }
}
