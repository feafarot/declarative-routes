import test from 'ava';

import {
  buildRoutes,
  parameter,
  route
} from './route-builder';

test('Simple route', (t) => {
  const routes = buildRoutes({
    category: route('category')
  });
  t.is(routes.category.render(), 'category');
});

test('Simple parameter', (t) => {
  const routes = buildRoutes({
    _id: parameter('_id')
  });
  t.is(routes._id(2).render(), '2');
});

test('Complex', (t) => {
  const routes = buildRoutes({
    order: route('order').withChildren({
      _id: parameter('id')
        .withChildren({
          edit: route('edit').withChildren({
            test: route('test')
          }),
          preview: route('preview')
        })
    }),
    cart: route('cart')
  });

  routes.order._id(3123).preview.render() // => order/3123/preview

  t.is(routes.order._id('o123').render(), 'order/o123');
  t.is(routes.order._id('o123').edit.render(), 'order/o123/edit');
});
