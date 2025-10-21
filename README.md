<h1 align="center">
  declarative-routes
  <br>
</h1>

<h4 align="center">Declarative and type-safe routes for any project</h4>

<p align="center">
  <a href="https://badge.fury.io/js/declarative-routes">
    <img src="https://badge.fury.io/js/declarative-routes.svg" alt="npm version" height="18">
  </a>
</p>

<p align="center">
  <a href="#about-declarative-routes">About declarative-routes</a> •
  <a href="#getting-started">Getting started</a> •
  <a href="#if-you-want-to-say-thanks">If you want to say thanks</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## About declarative-routes

The goal of this project is to provide a system to finally use routes in your application in a type-safe manner. That means no more magic strings in the navigation! Library is framework agnostic so it should work with any frontend framework. This library was designed with TypeScript in mind but should work with pure JavaScript as well, however I recommend TypeScript for everyone if you are thinking about type safety.

## Getting started

To install with npm

```bash
npm install declarative-routes
```

To install with yarn

```bash
yarn add declarative-routes
```

### Simple use-case

Imagine you have following routes in you application:
```
order/:id
order/:id/share
order/:id/edit
order/:id/edit/preview
cart
```
Where `:id` is a route-parameter.


Create file `routes.ts` in a place from where it would be comfortable to import.

```typescript
// routes.ts
import { buildRoutes, parameter, route } from './route-builder';

// Builds route table, accepts map-like object with routes
export const routes = buildRoutes({
  cart: route('cart'), // Simple route without any child routes
  order: route('order').withChildren({  // Simple route with children
    _id: parameter('id').withChildren({ // Nested parameter with children
        share: route('share')
        edit: route('edit').withChildren({
          preview: route('preview')
        }),
      }),
  })
});

```

Then whenever you want to generate navigation url:

```typescript
// some-place-with-nav.ts
import { routes } from './routes'; // Actual path here

// ...

/**
 * Given orderId = 'o-123' this function will return:
 * 'order/o-123/edit'
 */
function getEditUrl(orderId: string) {
  return routes.order._id(orderId).edit.render();
}

// ...

// Assuming you have relative navigation and you know
// you're inside 'order' route - you can create temp root route
// pointing at it

/**
 * Given orderId = 'o-123' this function will return:
 * 'o-123/edit'
 */
function getRelativeEditUrl(orderId: string) {  
  // Upon rendering this will remove anything leading to `_id`
  const orderRoute = routes.order._id(orderId).asRoot(); 
  return orderRoute.edit.render();
}
```

In case you're working with angular and want to use navigation:

```typescript
// component-with-nav.ts

// other angular imports...
import { Router } from '@angular/router';
import { routes } from './routes'; // Actual path here

@Component({
  template: '<a [routerLink]="getOrderUrl(testOrderId)"></a>'
})
class SomeComponent {
  private readonly router: Router; // Assuming it came from angular DI
  testOrderId = '0-123';

  // ... constructor etc.

  /**
   * Given orderId = 'o-123' this function will navigate to:
   * ['order', 'o-123', 'edit']
   * This could be used both for 'router.navigate' and [routerLink] directory
   */
  getOrderUrl(orderId: string) {
    return routes.order._id(orderId).edit.renderArray();
  }

  /**
   * Given orderId = 'o-123' this function will navigate to:
   * 'order/o-123/edit'
   */
  editOrder(orderId: string) {
    const navigationCommands = this.getOrderUrl(orderId);
    // navigationCommands = ['order', 'o-123', 'edit']
    this.router.navigate(this.getOrderUrl(orderId));
  }
}
```

## Contributing

Please let me know if you know how to improve library or  you know about any  uncovered use-cases. Or any feedback really.

## If you want to say thanks

Give a star to this project on github, that would be enough!

But you want to support me then you can

<a href="https://www.buymeacoffee.com/feafarot" target="_blank"><img src="https://img.buymeacoffee.com/api/?url=aHR0cHM6Ly9jZG4uYnV5bWVhY29mZmVlLmNvbS91cGxvYWRzL3Byb2ZpbGVfcGljdHVyZXMvMjAyMi8wNy8xb3RDQ25aRWJGTEFkb056LnBuZ0AzMDB3XzBlLndlYnA=&creator=Roman&design_code=1&design_color=%23ff813f&slug=feafarot" alt="Buy Me A Coffee" style="height: 80px !important;" ></a>


## License

MIT

---

> GitHub [@feafarot](https://github.com/feafarot)

