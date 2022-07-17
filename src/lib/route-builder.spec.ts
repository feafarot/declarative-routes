import test from 'ava';

import {
  buildRoutes,
  parameter,
  route,
  RoutesOptions
} from './route-builder';


test('[string] Simple route', (t) => {
  const routes = buildRoutes({
    category: route('category')
  });
  t.is(routes.category.render(), 'category');
});

test('[string] Simple parameter', (t) => {
  const routes = buildRoutes({
    _id: parameter('_id')
  });
  t.is(routes._id(2).render(), '2');
});

test('[string] Complex route table', (t) => {
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

test('[string] Leading separator', (t) => {
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

test('[string] Custom separator', (t) => {
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

test('[string] Complex asRoot()', (t) => {
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

/* Array render tests */

test('[array] Simple route', (t) => {
  const routes = buildRoutes({
    category: route('category')
  });
  t.deepEqual(routes.category.renderArray(), ['category']);
});

test('[array] Simple parameter', (t) => {
  const routes = buildRoutes({
    _id: parameter('_id')
  });
  t.deepEqual(routes._id(2).renderArray(), ['2']);
});

test('[array] Complex route table', (t) => {
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

  t.deepEqual(routes.order._id('o-123').renderArray(), ['order','o-123']);
  t.deepEqual(routes.order._id('o-123').edit.renderArray(), ['order','o-123','edit']);
  t.deepEqual(routes.order._id('o-123').share.renderArray(), ['order','o-123','share']);
  t.deepEqual(routes.order._id('o-123').edit.preview.renderArray(), ['order','o-123','edit','preview']);
  t.deepEqual(routes.order.all.renderArray(), ['order','all']);
  t.deepEqual(routes.cart.renderArray(), ['cart']);
});
