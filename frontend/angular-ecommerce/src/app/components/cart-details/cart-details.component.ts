import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalQuantity: number = 0;
  totalPrice: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartItemDetails();
  }

  listCartItemDetails() {
    
    // get a handle of cart items
    this.cartItems = this.cartService.cartItems;

    // subscribe total quantity from the cart service
    this.cartService.totalQuantity.subscribe (
      data => this.totalQuantity = data
    );

    // subscribe total price from the cart service
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    // compute cart total cost nd total quantity
    this.cartService.computeCartTotals();

  }

}
