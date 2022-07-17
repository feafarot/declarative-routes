import test from 'ava';

import {
  buildRoutes,
  parameter,
  route,
  RoutesOptions
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

test('Complex route table', (t) => {
  const routes = buildRoutes({
    order: route('order').withChildren({
      _id: parameter('id')
        .withChildren({
          share: route('share'),
          edit: route('edit').withChildren({
            preview: route('preview')
          }),
        }),
      all: route('all')
    }),
    cart: route('cart')
  });

  t.is(routes.order._id('o-123').render(), 'order/o-123');
  t.is(routes.order._id('o-123').edit.render(), 'order/o-123/edit');
  t.is(routes.order._id('o-123').share.render(), 'order/o-123/share');
  t.is(routes.order._id('o-123').edit.preview.render(), 'order/o-123/edit/preview');
  t.is(routes.order.all.render(), 'order/all');
  t.is(routes.cart.render(), 'cart');
});

test('Leading separator', (t) => {
  const options: Partial<RoutesOptions> = {
    leadingSeparator: true
  };
  const routes = buildRoutes(
    {
      _id: parameter('_id'),
      all: route('all')
    },
    options);

  t.is(routes._id(2).render(), '/2');
  t.is(routes.all.render(), '/all');
});

test('Custom separator', (t) => {
  const options: Partial<RoutesOptions> = {
    separator: '\\'
  };
  const routes = buildRoutes(
    {
      category: route('category').withChildren({
        _name: parameter('name')
      }),
    },
    options);

  t.is(routes.category._name('test').render(), 'category\\test');
});

test('Complex asRoot()', (t) => {
  const routes = buildRoutes({
    order: route('order').withChildren({
      _id: parameter('id')
        .withChildren({
          edit: route('edit').withChildren({
            test: route('test')
          }),
          preview: route('preview')
        }),
      all: route('all')
    }),
    cart: route('cart')
  });

  const orderRoute = routes.order._id('o-123').asRoot();

  t.is(orderRoute.render(), 'o-123');
  t.is(orderRoute.edit.render(), 'o-123/edit');
  t.is(orderRoute.edit.test.render(), 'o-123/edit/test');
  t.is(routes.order.all.asRoot().render(), 'all');
  t.is(routes.cart.render(), 'cart');
});
