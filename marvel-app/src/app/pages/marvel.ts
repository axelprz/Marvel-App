import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarvelService } from '../marvel.service';
import { Auth } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-marvel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './marvel.html'
})
export class MarvelComponent implements OnInit {
  characters: any[] = [];
  loading = true;
  searchTerm = '';
  offset = 0;
  limit = 10;
  total = 0;
  orderBy: string = 'name';
  onlyWithDescription = false;
  modifiedSince = '';

  constructor(private marvel: MarvelService, private auth: Auth, private toast: ToastService) {}

  favorites: Set<number> = new Set();
  pending: Set<number> = new Set();

  ngOnInit() {
    this.loadCharacters();
  }

  async markFavorites() {
    this.favorites = await this.marvel.getFavoriteIds();
  }

  loadCharacters() {
    this.loading = true;
    this.marvel.getCharacters(this.limit, this.offset).subscribe(async data => {
      this.characters = data.results;
      this.total = data.total;
      this.loading = false;
      await this.markFavorites();
    });
  }

  searchCharacters() {
    const useSearch =
      this.searchTerm.trim() !== '' ||
      this.onlyWithDescription ||
      this.modifiedSince !== '' ||
      this.orderBy !== 'name';

    if (!useSearch) {
      this.offset = 0;
      this.loadCharacters();
      return;
    }

    this.loading = true;

    this.marvel
      .searchCharacters(
        this.searchTerm,
        this.limit,
        this.offset,
        this.orderBy,
        this.onlyWithDescription,
        this.modifiedSince
      )
      .subscribe(async (data) => {
        this.characters = data.results;
        this.total = data.total;
        await this.markFavorites();
        this.loading = false;
      });
  }

  onSearch() {
    this.offset = 0;
    this.searchCharacters();
  }

  nextPage() {
    this.offset += this.limit;
    this.searchTerm ? this.searchCharacters() : this.loadCharacters();
  }

  prevPage() {
    if (this.offset === 0) return;
    this.offset -= this.limit;
    this.searchTerm ? this.searchCharacters() : this.loadCharacters();
  }

  async toggleFavorite(character: any) {
    const id = character.id;
    this.pending.add(id);
    if (this.favorites.has(id)) {
      await this.marvel.removeFavorite(id);
      this.favorites.delete(id);
      this.toast.show('❌ Quitado de favoritos');
    } else {
      await this.marvel.addFavorite(character);
      this.favorites.add(id);
      this.toast.show('✅ Agregado a favoritos');
    }
    this.pending.delete(id);
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  clearFilters() {
    this.orderBy = 'name';
    this.onlyWithDescription = false;
    this.modifiedSince = '';
    this.searchTerm = '';
    this.offset = 0;
    this.searchCharacters();
  }

}
