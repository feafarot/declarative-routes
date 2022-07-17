const getKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof T>

export interface RoutesOptions {
  separator: string;
  leadingSeparator: boolean;
}

const defaultOptions: RoutesOptions = {
  separator: '/',
  leadingSeparator: false
}

class RouteBuilder<TParam extends true | false, TChildren = Record<string, never>> {
  constructor(
    public path: string,
    public isParam: TParam,
    public children: TChildren) {
  }

  withChildren<TRoutes>(routes: TRoutes) {
    return new RouteBuilder<TParam, TRoutes>(this.path, this.isParam, routes);
  }
}

type RouteBuilders<T> = {
  [k in keyof T]: T[k] extends RouteBuilder<infer TP, infer TR>
    ? RouteBuilder<TP, TR>
    : never
};

//#region Route Types
export type SimpleRoute<TRoutes> = {
  [k in keyof TRoutes]: Route<TRoutes[k]>;
} & {
  render(): string;
  asRoot(): SimpleRoute<TRoutes>;
};

export type ParamRoute<TRoutes> = {
  <TValue>(value: TValue): SimpleRoute<TRoutes>;
};

type Route<TBuilder> =
  TBuilder extends RouteBuilder<true, infer TRoutes>
  ? ParamRoute<TRoutes>
  : TBuilder extends RouteBuilder<false, infer TRoutes>
    ? SimpleRoute<TRoutes> : never;

type RoutesMap<TRoutes> = {
  [k in keyof TRoutes]: Route<TRoutes[k]>;
}
//#endregion


function combine<T>(
  resolvePrefix: (() => string) | undefined,
  fragment: T,
  options: RoutesOptions) {
  const prefix = resolvePrefix
    ? `${resolvePrefix()}${options.separator}`
    : options.leadingSeparator ? `${options.separator}` : ''
  return `${prefix}${fragment}`;
}

function buildRoutesInner<TRouteBuilders extends RouteBuilders<TRouteBuilders>>(
  routeBuilders: TRouteBuilders,
  options: RoutesOptions,
  prefixRenderer?: () => string)
  : RoutesMap<TRouteBuilders>
{
  return getKeys(routeBuilders).reduce<RoutesMap<TRouteBuilders>>(
    (final, key) => {
      const routeBuilder = routeBuilders[key];
      if (routeBuilder.isParam) {
        final[key] = (<T>(value: T) => {
          const renderer = () => combine(prefixRenderer, value, options);
          const asRootRenderer = () => combine(undefined, value, options);
          return {
            render: renderer,
            asRoot: () => ({
              render: asRootRenderer,
              ...buildRoutesInner(routeBuilder.children as unknown, options, asRootRenderer)
            }),
            ...buildRoutesInner(routeBuilder.children as unknown, options, renderer)
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;
      }
      else {
        const renderer = () => combine(prefixRenderer, routeBuilder.path, options);
        const asRootRenderer = () => combine(undefined, routeBuilder.path, options);
        final[key] = {
          render: renderer,
          asRoot: () => ({
            render: asRootRenderer,
            ...buildRoutesInner(routeBuilder.children as unknown, options, asRootRenderer)
          }),
          ...buildRoutesInner(routeBuilder.children as unknown, options, renderer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }

      return final;
    },
    {} as RoutesMap<TRouteBuilders>);
}

/**
 * Creates declarative routes object.
 * @param routeBuilders Map-object with route definitions
 * @param options Route builder options
 * @returns Declarative routes object
 */
export function buildRoutes<TRouteBuilders extends RouteBuilders<TRouteBuilders>>(
  routeBuilders: TRouteBuilders,
  options?: Partial<RoutesOptions>)
  : RoutesMap<TRouteBuilders>
{
  const fullOptions = Object.assign({} as RoutesOptions, defaultOptions, options);
  return buildRoutesInner(routeBuilders, fullOptions);
}

/**
 * Defines parameter route fragment
 * @param parameter Parameter name
 * @returns Route builder
 */
export function parameter(parameter: string) {
  return new RouteBuilder(parameter, true, {});
}


/**
 * Defines simple route fragment
 * @param path Route fragment
 * @returns Route builder
 */
export function route(path: string) {
  return new RouteBuilder(path, false, {});
}
