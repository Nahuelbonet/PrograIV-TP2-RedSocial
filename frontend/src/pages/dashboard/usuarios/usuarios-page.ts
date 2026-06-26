import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios';
import { AuthService } from '../../../services/auth';
import { Boton } from '../../../components/boton/boton';
import { User } from '../../../models/user.model';

// Valida que las dos contraseñas coincidan (igual que en el registro)
function passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('repetirPassword')?.value;
  return pass === confirm ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-usuarios-page',
  imports: [ReactiveFormsModule, DatePipe, Boton],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.scss',
})
export class UsuariosPage implements OnInit {
  private usuariosService = inject(UsuariosService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  // ── Listado ──
  usuarios: User[] = [];
  loading = false;
  error = '';

  // id del admin logueado (para no dejar que se deshabilite a sí mismo)
  usuarioActualId = this.auth.getUsuario()?._id ?? '';

  // ── Formulario de alta ──
  abierto = false;
  fotoFile: File | null = null;
  errorMsg = '';
  guardando = false;

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
      perfil: ['usuario', Validators.required], // los dos radio buttons
    },
    { validators: passwordsCoinciden },
  );

  get nombre() { return this.form.get('nombre')!; }
  get apellido() { return this.form.get('apellido')!; }
  get correo() { return this.form.get('correo')!; }
  get nombreUsuario() { return this.form.get('nombreUsuario')!; }
  get password() { return this.form.get('password')!; }
  get repetirPassword() { return this.form.get('repetirPassword')!; }
  get fechaNacimiento() { return this.form.get('fechaNacimiento')!; }

  ngOnInit(): void {
    this.cargar();
  }

  // ── Cargar el listado de usuarios ──
  cargar(): void {
    this.loading = true;
    this.error = '';
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.loading = false;
      },
    });
  }

  // ── Habilitar / deshabilitar (alta y baja lógica) ──
  cambiarEstado(usuario: User): void {
    const accion = usuario.habilitado
      ? this.usuariosService.deshabilitar(usuario._id)
      : this.usuariosService.habilitar(usuario._id);

    accion.subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: () => (this.error = 'No se pudo cambiar el estado del usuario.'),
    });
  }

  // Reemplaza el usuario en la lista por su versión actualizada
  private reemplazar(actualizado: User): void {
    const i = this.usuarios.findIndex((u) => u._id === actualizado._id);
    if (i !== -1) this.usuarios[i] = actualizado;
  }

  // ── Formulario de alta ──
  toggle(): void {
    this.abierto = !this.abierto;
    if (!this.abierto) this.resetear();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.fotoFile = input.files[0];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
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

    this.usuariosService.crear(formData).subscribe({
      next: (nuevo) => {
        this.usuarios = [nuevo, ...this.usuarios]; // lo agregamos arriba de la lista
        this.abierto = false;
        this.resetear();
      },
      error: (err) => {
        const msg = err.error?.message;
        this.errorMsg = Array.isArray(msg)
          ? msg.join(' • ')
          : (msg || 'No se pudo crear el usuario.');
        this.guardando = false;
      },
    });
  }

  private resetear(): void {
    this.form.reset({ perfil: 'usuario' });
    this.fotoFile = null;
    this.errorMsg = '';
    this.guardando = false;
  }
}
