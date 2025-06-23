import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { map } from 'rxjs';
import { Firestore, collection, doc, setDoc, deleteDoc, getDoc, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MarvelService {
  private publicKey = environment.marvelPublicKey;
  private privateKey = environment.marvelPrivateKey;
  private baseUrl = 'https://gateway.marvel.com/v1/public';

  constructor(private http: HttpClient, private firestore: Firestore, private auth: Auth) {}

  getCharacters(limit = 10, offset = 0) {
    const ts = new Date().getTime().toString();
    const hash = CryptoJS.MD5(ts + this.privateKey + this.publicKey).toString();
    const url = `${this.baseUrl}/characters?limit=${limit}&offset=${offset}&ts=${ts}&apikey=${this.publicKey}&hash=${hash}`;

    return this.http.get<any>(url).pipe(
      map(res => ({
        results: res.data.results,
        total: res.data.total
      }))
    );
  }

  searchCharacters(
    name: string,
    limit = 10,
    offset = 0,
    orderBy: string = 'name',
    onlyWithDescription: boolean = false,
    modifiedSince: string = ''
  ) {
    const ts = new Date().getTime().toString();
    const hash = CryptoJS.MD5(ts + this.privateKey + this.publicKey).toString();

    let params = `limit=${limit}&offset=${offset}&orderBy=${orderBy}`;
    
    if (name.trim() !== '') {
      params += `&nameStartsWith=${name}`;
    }

    if (modifiedSince) {
      params += `&modifiedSince=${modifiedSince}`;
    }

    const url = `${this.baseUrl}/characters?${params}&ts=${ts}&apikey=${this.publicKey}&hash=${hash}`;

    return this.http.get<any>(url).pipe(
      map(res => {
        let results = res.data.results;

        if (onlyWithDescription) {
          results = results.filter((char: any) => char.description && char.description.trim() !== '');
        }

        return {
          results,
          total: results.length
        };
      })
    );
  }

  async addFavorite(character: any) {
    const user = this.auth.currentUser;
    if (!user) return;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${character.id}`);
    await setDoc(ref, character);
  }

  async removeFavorite(characterId: number) {
    const user = this.auth.currentUser;
    if (!user) return;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${characterId}`);
    await deleteDoc(ref);
  }

  async isFavorite(characterId: number): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${characterId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async getFavorites(): Promise<any[]> {
    const user = this.auth.currentUser;
    if (!user) return [];

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    const snap = await getDocs(ref);
    return snap.docs.map(doc => doc.data());
  }

  async getFavoriteIds(): Promise<Set<number>> {
    const user = this.auth.currentUser;
    if (!user) return new Set();

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    const snap = await getDocs(ref);
    const ids = snap.docs.map(doc => Number(doc.id));
    return new Set(ids);
  }

  getCharacterById(id: number) {
    const ts = new Date().getTime().toString();
    const hash = CryptoJS.MD5(ts + this.privateKey + this.publicKey).toString();
    const url = `${this.baseUrl}/characters/${id}?ts=${ts}&apikey=${this.publicKey}&hash=${hash}`;

    return this.http.get<any>(url).pipe(
      map(res => res.data.results[0])
    );
  }
}