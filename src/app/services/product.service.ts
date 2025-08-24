import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Product {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  imgUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private jsonUrl = 'assets/products.json'; // JSON local
  private products: Product[] = []; // Simulamos base de datos

  constructor(private http: HttpClient) {}

  /** GET - Listar productos desde JSON */
  getProducts(): Observable<Product[]> {
    // Si ya tenemos la data cargada, devolvemos la caché en memoria
    if (this.products.length > 0) {
      return of(this.products);
    }

    // Si no, cargamos el JSON y lo guardamos en memoria
    return this.http.get<Product[]>(this.jsonUrl).pipe(
      tap(data => this.products = data)
    );
  }

  /** POST - Crear producto en memoria */
  createProduct(product: Product): Observable<Product> {
    // Generamos un ID nuevo autoincremental
    const newProduct: Product = {
      ...product,
      id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id || 0)) + 1 : 1
    };

    this.products.push(newProduct);
    return of(newProduct); // Simulamos respuesta de API
  }

  /** DELETE - Eliminar producto en memoria */
  deleteProduct(id: number): Observable<Product[]> {
    this.products = this.products.filter(p => p.id !== id);
    return of(this.products); // Devolvemos la lista actualizada
  }
}
