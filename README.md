<h1 align="center">
  <br>
  <!-- <a href="http://www.amitmerchant.com/electron-markdownify"><img src="https://raw.githubusercontent.com/amitmerchant1990/electron-markdownify/master/app/img/markdownify.png" alt="declarative-routes" width="200"></a> -->
  <br>
  declarative-routes
  <br>
</h1>

<h4 align="center">Declarative and type-safe routes for any project</h4>

<p align="center">
  <a href="https://badge.fury.io/js/declarative-routes">
    <img src="https://badge.fury.io/js/declarative-routes.svg" alt="npm version" height="18">
  </a>
  <a href="https://saythanks.io/to/sly.feafarot">
      <img src="https://img.shields.io/badge/SayThanks.io-%E2%98%BC-1EAEDB.svg">
  </a>
  <a href="https://www.paypal.com/donate/?hosted_button_id=DTZHX4MFLU3HY">
    <img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat">
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

The goal of this project is to provide a system to finally use routes in your application in a type-safe manner. That means no more magic strings when for navigation! This library was designed with TypeScript in mind but should work with pure JavaScript as well, however I recommend TypeScript for everyone if you are thinking about type safety.

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
 * Given orderId = 'o-123' this method will return:
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
 * Given orderId = 'o-123' this method will return:
 * 'o-123/edit'
 */
function getRelativeEditUrl(orderId: string) {  
  // Upon rendering this will remove anything leading to `_id`
  const orderRoute = routes.order._id(orderId).asRoot(); 
  return orderRoute.edit.render();
}

// ...
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

