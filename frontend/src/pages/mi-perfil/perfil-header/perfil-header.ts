import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NgStyle } from '@angular/common';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-perfil-header',
  imports: [NgStyle],
  templateUrl: './perfil-header.html',
  styleUrl: './perfil-header.scss',
})
export class PerfilHeader implements OnInit {
  @Input() usuario!: User;
  @Output() editar = new EventEmitter<void>();
  @Output() bannerChange = new EventEmitter<File>();
  @Output() posicionChange = new EventEmitter<string>();

  reposicionando = false;
  posX = 50;
  posY = 50;
  private posXOriginal = 50;
  private posYOriginal = 50;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.usuario.fotoBannerPos) {
      const parts = this.usuario.fotoBannerPos.split(' ');
      this.posX = parseFloat(parts[0]) || 50;
      this.posY = parseFloat(parts[1]) || 50;
    }
  }

  get coverStyle(): Record<string, string> {
    if (!this.usuario.fotoBanner) return {};
    return {
      backgroundImage: `url(${this.usuario.fotoBanner})`,
      backgroundPosition: `${this.posX}% ${this.posY}%`,
    };
  }

  onBannerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.bannerChange.emit(input.files[0]);
      input.value = '';
    }
  }

  iniciarReposicion(): void {
    this.posXOriginal = this.posX;
    this.posYOriginal = this.posY;
    this.reposicionando = true;
  }

  cancelarReposicion(): void {
    this.posX = this.posXOriginal;
    this.posY = this.posYOriginal;
    this.reposicionando = false;
  }

  guardarReposicion(): void {
    this.posicionChange.emit(`${Math.round(this.posX)}% ${Math.round(this.posY)}%`);
    this.reposicionando = false;
  }

  onCoverMouseDown(event: MouseEvent): void {
    if (!this.reposicionando) return;
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    event.preventDefault();
  }

  onCoverTouchStart(event: TouchEvent): void {
    if (!this.reposicionando) return;
    this.dragging = true;
    this.lastX = event.touches[0].clientX;
    this.lastY = event.touches[0].clientY;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    this.applyDrag(event.clientX, event.clientY);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.dragging) return;
    this.applyDrag(event.touches[0].clientX, event.touches[0].clientY);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd(): void {
    this.dragging = false;
  }

  private applyDrag(clientX: number, clientY: number): void {
    const coverEl = this.el.nativeElement.querySelector('.cover') as HTMLElement;
    const w = coverEl?.offsetWidth || 600;
    const h = coverEl?.offsetHeight || 100;
    const dx = clientX - this.lastX;
    const dy = clientY - this.lastY;
    this.lastX = clientX;
    this.lastY = clientY;
    this.posX = Math.max(0, Math.min(100, this.posX - (dx / w) * 100));
    this.posY = Math.max(0, Math.min(100, this.posY - (dy / h) * 100));
  }
}
