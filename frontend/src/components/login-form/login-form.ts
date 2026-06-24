import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SesionService } from '../../services/sesion.service';
import { Boton } from '../boton/boton';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, RouterLink, Boton],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private sesion = inject(SesionService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    nombreUsuario: ['', [Validators.required]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
    ]]
  });

  errorMsg = '';
  loading = false;

  get nombreUsuario() { return this.form.get('nombreUsuario')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const { nombreUsuario, password } = this.form.value;
    this.auth.login(nombreUsuario, password).subscribe({
      next: () => { this.sesion.iniciarContador(); this.router.navigate(['/publicaciones']); },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}
