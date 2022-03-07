import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalQuantity: number = 0;
  totalPrice: number = 0;

  creditCardMonths: number[] =[];
  creditCardYears: number[] = []; 

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private shopFormService: ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCarDetails();
    
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, 
                                        Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, 
                                       Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('',
                          [Validators.required, 
                          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]
        )
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', 
                              [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', 
                             [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', 
                             [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace])
      }),

      billingAddress: this.formBuilder.group({
        street: new FormControl('', 
                              [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', 
                             [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', 
                             [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2)]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    })

    // populate credit card months
    const currentMonth = new Date().getMonth() + 1; // Months is 0 based. So add +1
    this.shopFormService.getCreditCardMonths(currentMonth).subscribe(
      data => {
        console.log("Retreive credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years
    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieve credit card years: "+JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    // populate countries
    this.shopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
  } // End of ngOnInit()

  reviewCarDetails() {
    
    // Get total Quantity. Using Behaviour subject in Cart service as the checkout component
    // is initialized after the product component and checkout component
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

    // Get total price
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );
  }

  // getters for fields
  // Why getters for the feilds ??? - To access the form controls in HTML
  // For example, shippingAddressStreet : <div *ngIf="shippingAddressCountry.invalid
  // shippingAddressCountry.invalid will look for validations based on the validation we gave above
  // Then based on the validation failed the related text will be shown 'Street required' or 'Street must be atleast 2 chars'
  get firstName() { return this.checkoutFormGroup.get('customer.firstName')  };
  get lastName() { return this.checkoutFormGroup.get('customer.lastName') };
  get email() { return this.checkoutFormGroup.get('customer.email') };

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street') };
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city') };
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state') };
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country') };
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode') };

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street') };
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city') };
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state') };
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country') };
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode') };

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType') };
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard') };
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber') };
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode') };

  getStates(formGroupName: string){

    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name; // For logging purpose

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        
        if(formGroupName === 'billingAddress'){
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup.get('state').setValue(data[0]);

      }
    )

  }

  onSubmit(){

    console.log("Handling submit (purchase) button");
    
    if(this.checkoutFormGroup.invalid){
        this.checkoutFormGroup.markAllAsTouched();
        return;
    }
    
    // set up order
    let order = new Order();
    order.totalQuantity = this.totalQuantity;
    order.totalPrice = this.totalPrice;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way 
    /* let orderItems: OrderItem[] = [];
     for(let i=0; i < cartItems.length; i++){
        orderItems[i] = new OrderItem(cartItems[i]);
        console.log("Cart items..."+orderItems[i].imageUrl);
        console.log("Order items..."+orderItems[i].imageUrl);
    }  */ 


    // - short way of doing the same thing
    let orderItems: OrderItem[] = cartItems.map(eachCartItem => new OrderItem(eachCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.get('customer').value; 

    // populate purchase - shipiing address
    purchase.shippingAddress = this.checkoutFormGroup.get('shippingAddress').value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.get("billingAddress").value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and order items
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API through Checkoutservice
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => { 
         alert(`Order has been placed successfully. Your tracking number is ${response.orderTrackingNumber}`);

         // reset cart
         this.resetCart();
      },
      error: response => {
        alert(`There was an error ${response.error}`);
      }

     }      
    );
    
  }
  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalQuantity.next(0);
    this.cartService.totalPrice.next(0);

    // reset the form 
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");

  }

  copyShippingAddressToBillingAddress(event){

    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress']
             .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

       // bug fix for states
       // the above set value does not copy the states value
       this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }

  }

  handleMonthsAndYears(){

    // get the creditcard form and selected year from the form
    const creditCardFormGroup = this.checkoutFormGroup.get("creditCard");
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // get the current year
    const currentYear: number = new Date().getFullYear();

    let startMonth: number;
    
    if(selectedYear === currentYear){
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Months for Credit card form: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }

}
