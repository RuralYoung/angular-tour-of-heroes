import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  // url to the web API
  private heroesUrl = 'api/heroes';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor( 
    private http: HttpClient,
    private messageService: MessageService ) { }

  // GET: Gets the heroes from the server
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }
  
  // GET: Gets the hero by id. 404s if not found.
  getHero(id: number): Observable<Hero> {
    // Error handling will be inplemented in the next chaptor of the tutorial
    const url = `${this.heroesUrl}/${id}`;

    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  // GET hero by id. Returns an Undefined when the id is not found
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${ this.heroesUrl }/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map( heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${ outcome } `);
        }),
        catchError( this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  // GET: get the hero whose name contains the search term 
  searchHeroes(term: string): Observable<Hero[]> {
    if ( !term.trim() ) {
      // if not search term, return empty hero array
      return of([]);
    }
    return this.http.get<Hero[]>(`${ this.heroesUrl }/?name=${ term }`).pipe(
      tap(x => x.length ?
        this.log(`found heroes matching "${ term }"`) :
        this.log(`no heroes matching "${ term }"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  // POST: Adds a new hero to the server
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(( newHero: Hero ) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  // DELETE: Delete a hero from the list
  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`delete hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  // PUT: Update a hero on the server
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  private handleError<T>( operation = 'operation', result?: T ) {
  /**
   * Handle Http operation failure and then continue the program
   * 
   * @param operation - name of the operation that failed.
   * @param result - optional value to return as the observable result
   */
      return (error: any): Observable<T> => {
  
        console.error(error);
  
        this.log(`${operation} failed: ${error.message}`);
  
        return of(result as T);
      };
    }

  // Logging what happens via MessageService
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}