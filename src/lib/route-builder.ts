const getKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof T>;

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
// TODO: Rework to class?
export type SimpleRoute<TRoutes> = {
  [k in keyof TRoutes]: Route<TRoutes[k]>;
} & {
  /** Renders route as string with separators */
  render(): string;
  /**
   * Renders route as string with separators
   * @experimental This might be removed in future release
   */
  _r(): string;
  /** Renders route as array of strings */
  renderArray(): string[];
  /**
   * Renders route as array of strings
   * @experimental This might be removed in future release
   */
  _ra(): string[];
  /** Truncates all leading route fragments to this route */
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

// class Renderer {
//   constructor(
//     private readonly fragment: string,
//     private readonly prefixRenderer: Renderer | null,
//     private readonly options: RoutesOptions) { }

//   render(asRoot = false): string {
//     const prefixRenderer = asRoot ? undefined : this.prefixRenderer;
//     const prefix = prefixRenderer
//       ? `${prefixRenderer.render()}${this.options.separator}`
//       : this.options.leadingSeparator ? `${this.options.separator}` : ''
//     return `${prefix}${this.fragment}`;
//   }

//   renderAsArray(asRoot = false): string[] {
//     const prefixRenderer = asRoot ? undefined : this.prefixRenderer;
//     return [...(prefixRenderer?.renderAsArray() || []), `${this.fragment}`];
//   }
// }

class Renderer {
  constructor(
    private readonly fragment: string,
    private readonly prefixRenderer: Renderer | undefined,
    private readonly options: RoutesOptions) { }

  render(): string {
    const prefix = this.prefixRenderer
      ? `${this.prefixRenderer.render()}${this.options.separator}`
      : this.options.leadingSeparator
        ? `${this.options.separator}`
        : '';
    return `${prefix}${this.fragment}`;
  }

  renderAsArray(): string[] {
    return [
      ...(this.prefixRenderer?.renderAsArray() || []),
      `${this.fragment}`
    ];
  }

  asRoot() {
    return new Renderer(this.fragment, null, this.options);
  }
}

// function combine<T>(
//   resolvePrefix: (() => string) | undefined,
//   fragment: T,
//   options: RoutesOptions) {
//   const prefix = resolvePrefix
//     ? `${resolvePrefix()}${options.separator}`
//     : options.leadingSeparator ? `${options.separator}` : ''
//   return `${prefix}${fragment}`;
// }

// function combineToArray<T>(
//   resolvePrefix: (() => string[]) | undefined,
//   fragment: T) {
//   return [...(resolvePrefix?.() || []), `${fragment}`];
// }


function buildRoute<TChildren extends RouteBuilders<TChildren>>(
  children: TChildren,
  fragment: string,
  prefixRenderer: Renderer | undefined,
  options: RoutesOptions)
  : SimpleRoute<TChildren>
{
  const renderer = new Renderer(fragment, prefixRenderer, options);
  return {
    render: () => renderer.render(),
    renderArray: () => renderer.renderAsArray(),
    _r: () => renderer.render(),
    _ra: () => renderer.renderAsArray(),
    asRoot: () => buildRoute(children, fragment, undefined, options),
    ...buildRoutesInner(children, options, renderer)
  };
}

function buildRoutesInner<TRouteBuilders extends RouteBuilders<TRouteBuilders>>(
  routeBuilders: TRouteBuilders,
  options: RoutesOptions,
  prefixRenderer?: Renderer)
  : RoutesMap<TRouteBuilders>
{
  // TODO: Improve type-safety to avoid 'any'
  //       PS: I will appreciate any help with this
  return getKeys(routeBuilders).reduce<RoutesMap<TRouteBuilders>>(
    (final, key) => {
      const routeBuilder = routeBuilders[key];
      if (routeBuilder.isParam) {
        final[key] = (<T>(value: T) => {
          return buildRoute(
            routeBuilder.children,
            `${value}`,
            prefixRenderer,
            options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;
      }
      else {
        final[key] = buildRoute(
          routeBuilder.children,
          routeBuilder.path,
          prefixRenderer,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options) as any;
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
