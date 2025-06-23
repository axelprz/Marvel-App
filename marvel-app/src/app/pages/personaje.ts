import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MarvelService } from '../marvel.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-personaje',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personaje.html',
  styleUrl: './personaje.css'
})
export class PersonajeComponent implements OnInit {
  character: any;
  loading = true;

  constructor(private route: ActivatedRoute, private marvel: MarvelService, private location: Location) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.marvel.getCharacterById(id).subscribe(data => {
      this.character = data;
      this.loading = false;
    });
  }

  volver() {
    this.location.back();
  }
}
