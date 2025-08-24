import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from 'src/app/services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  selectedImage: string | null = null;

  products: Product[] = [];
  productForm!: FormGroup;
  submitted = false;
  selectedProductId: number | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();


    this.productForm = this.fb.group({
  nombre: [
    '',
    [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30) // ✅ Máximo 30 caracteres (ajustado)
    ]
  ],
  precio: [
    '',
    [
      Validators.required,
      Validators.pattern(/^\d+$/), // ✅ Solo números, sin puntos ni comas
      Validators.min(1),           // ✅ Mínimo 1
      Validators.max(1000000)      // ✅ Máximo 1,000,000
    ]
  ],
  stock: [
    0,
    [
      Validators.required,
      Validators.pattern(/^\d+$/), // ✅ Solo números enteros válidos
      Validators.min(0),           // ✅ Mínimo 0
      Validators.max(10000)        // ✅ Máximo 10,000
    ]
  ],
  imgUrl: ['']
});
  }

  /** Cargar productos desde el JSON */
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res;
      },
      error: (err) => console.error('❌ Error cargando productos:', err),
    });
  }

  deleteProduct(): void {
    if (!this.selectedProductId) return;

    this.productService.deleteProduct(this.selectedProductId).subscribe({
      next: (updatedProducts) => {
        this.products = updatedProducts;

        // Cerramos modal correctamente
        const modalEl = document.getElementById('confirmDeleteModal');
        if (modalEl) {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }

        // 🔹 Solución: limpiar backdrop y estilos bloqueados
        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach((backdrop) => backdrop.remove());
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }, 200);
      },
      error: (err) => console.error('❌ Error eliminando producto:', err),
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.productForm.invalid) return;

    const productData: Product = {
      ...this.productForm.value,
      imgUrl: this.selectedImage || 'assets/img/default.png',
    };

    // Llamamos al servicio para crear el producto
    this.productService.createProduct(productData).subscribe({
      next: (newProduct) => {
        this.loadProducts();
        this.productForm.reset();
        this.submitted = false;

        const modalEl = document.getElementById('createProductModal');
        if (modalEl) {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }

        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach((backdrop) => backdrop.remove());
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }, 200);
      },
      error: (err) => {
        console.error('❌ Error al crear producto:', err);
      },
    });
  }
}
