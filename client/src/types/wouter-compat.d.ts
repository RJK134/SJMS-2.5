import type * as React from 'react';
import type { DefaultParams, PathPattern, RouteProps } from 'wouter';

declare module 'wouter' {
  export function Route<
    T extends DefaultParams | undefined = undefined,
    RoutePath extends PathPattern = PathPattern,
  >(props: RouteProps<T, RoutePath>): React.ReactElement | null;
}
