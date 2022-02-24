import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(theCartItem: CartItem){

    // Check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if(this.cartItems.length > 0){
    // find the item in the cart based on item id
   
    // Following code is refractored to use the array.find()
    
    // for(let tempCartItem of this.cartItems){
    //   if(tempCartItem.id === theCartItem.id){
    //     existingCartItem = tempCartItem;
    //     break;
    //   }
    // }

        existingCartItem = this.cartItems.find(eachCartItem => eachCartItem.id === theCartItem.id);

        // check if we found it
        alreadyExistsInCart = (existingCartItem != undefined);
    }

    if(alreadyExistsInCart){
       // increment the quantity
       existingCartItem.quantity++;
    } else {
      // just add the item to the array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quantity
    this.computeCartTotals();
  }
  computeCartTotals() {
    
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let eachCartItem of this.cartItems){

      totalPriceValue += eachCartItem.quantity * eachCartItem.unitPrice;
      totalQuantityValue += eachCartItem.quantity;
    }

    // publish the new values... all the subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);    

    // log data for debuggin purpsose
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    
    console.log('Contents of the cart');

    for(let tempCartItem of this.cartItems){

      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name=${tempCartItem.name}, quantity=${tempCartItem.quantity}, price=${tempCartItem.unitPrice}, subTotal=${subTotalPrice}`);
    }

    console.log(`Total Price = ${totalPriceValue.toFixed(2)}, Total Quantity= ${totalQuantityValue}`);
    console.log('-----');

  }

  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if(theCartItem.quantity == 0){
      this.remove(theCartItem);
    } else{
      this,this.computeCartTotals();
    }
    
  }
  remove(theCartItem: CartItem) {
    
    // find the index of item in the cartItems array
    const cartItemIndex = this.cartItems.findIndex( tempCartItem => tempCartItem.id === theCartItem.id);

    // If not found the index will be -1. If found index will be greater than 1
    // if found, remove the item from the array at given index
    if(cartItemIndex > -1){
      this.cartItems.splice(cartItemIndex, 1);

      this.computeCartTotals();
    }
    


  }
}
