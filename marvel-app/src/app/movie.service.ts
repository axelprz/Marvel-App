import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Firestore, collection, doc, setDoc, deleteDoc, getDoc, getDocs, where, query } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[]; 
  vote_count?: number;
}

export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface DiscoverParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  vote_count_gte?: number;
}


@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiKey = environment.tmdbApiKey; 
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient, private firestore: Firestore, private auth: Auth) {}


  getPosterUrl(posterPath: string | null): string {
    if (posterPath) {
      return `${this.imageBaseUrl}${posterPath}`;
    }
    return 'assets/placeholder-image.png'; 
  }

  getPopularMovies(page: number = 1): Observable<MovieListResponse> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=es-ES&page=${page}`;
    return this.http.get<MovieListResponse>(url);
  }

  searchMovies(
    name: string,
    page: number = 1
  ): Observable<MovieListResponse> {
    
    if (name.trim() === '') {
      return this.getPopularMovies(page); 
    }
    
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=es-ES&query=${encodeURIComponent(name)}&page=${page}`;
    
    return this.http.get<MovieListResponse>(url);
  }

  discoverMovies(params: DiscoverParams): Observable<MovieListResponse> {
    let httpParams = new HttpParams();
    
    httpParams = httpParams.set('api_key', this.apiKey);
    httpParams = httpParams.set('language', 'es-ES');

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.with_genres) httpParams = httpParams.set('with_genres', params.with_genres);
    if (params.primary_release_year) httpParams = httpParams.set('primary_release_year', params.primary_release_year.toString());
    if (params.vote_count_gte) httpParams = httpParams.set('vote_count.gte', params.vote_count_gte.toString());

    const url = `${this.baseUrl}/discover/movie`;

    return this.http.get<MovieListResponse>(url, { params: httpParams });
  }

  getMovieById(id: number): Observable<Movie> {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=es-ES`;
    return this.http.get<Movie>(url);
  }

  getMovieGenres(): Observable<{ genres: Genre[] }> {
    const url = `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=es-ES`;
    return this.http.get<{ genres: Genre[] }>(url);
  }

  async addFavorite(movie: Movie) {
    const user = this.auth.currentUser;
    if (!user) return;
    
    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movie.id}`);
    await setDoc(ref, movie); 
  }

  async removeFavorite(movieId: number) {
    const user = this.auth.currentUser;
    if (!user) return;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    await deleteDoc(ref);
  }

  async isFavorite(movieId: number): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async getFavorites(): Promise<Movie[]> {
    const user = this.auth.currentUser;
    if (!user) return [];

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    const snap = await getDocs(ref);
    return snap.docs.map(doc => doc.data() as Movie);
  }

  async getFavoriteIds(): Promise<Set<number>> {
    const user = this.auth.currentUser;
    if (!user) return new Set();

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    const snap = await getDocs(ref);
    const ids = snap.docs.map(doc => Number(doc.id));
    return new Set(ids);
  }
}