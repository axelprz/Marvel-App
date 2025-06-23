import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarvelService } from '../marvel.service';
import { ToastService } from '../toast.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent implements OnInit {
  favorites: any[] = [];
  loading = true;
  pending: Set<number> = new Set();
  searchTerm = '';
  orderBy = 'name';
  onlyWithDescription = false;
  modifiedSince = '';
  filteredFavorites: any[] = [];

  constructor(private marvel: MarvelService, private toast: ToastService) {}

  async ngOnInit() {
    this.favorites = await this.marvel.getFavorites();
    this.applyFilters();
    this.loading = false;
  }

  async remove(id: number) {
    this.pending.add(id);
    await this.marvel.removeFavorite(id);
    this.favorites = this.favorites.filter(c => c.id !== id);
    this.pending.delete(id);
    this.toast.show('❌ Eliminado de favoritos');
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.favorites];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(char => char.name.toLowerCase().includes(term));
    }

    if (this.onlyWithDescription) {
      filtered = filtered.filter(char => char.description && char.description.trim() !== '');
    }

    if (this.modifiedSince) {
      const since = new Date(this.modifiedSince);
      filtered = filtered.filter(char => new Date(char.modified) >= since);
    }

    if (this.orderBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.orderBy === '-name') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (this.orderBy === 'modified') {
      filtered.sort((a, b) => new Date(a.modified).getTime() - new Date(b.modified).getTime());
    } else if (this.orderBy === '-modified') {
      filtered.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    }

    this.filteredFavorites = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.orderBy = 'name';
    this.onlyWithDescription = false;
    this.modifiedSince = '';
    this.applyFilters();
  }
}
