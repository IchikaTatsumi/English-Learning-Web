// Temporary shim for projects that haven't installed `react-hook-form` yet.
// Install the real package (npm i react-hook-form) to get proper types.
declare module 'react-hook-form' {
  import * as React from 'react';

  // Minimal types to satisfy imports used in this project. They are intentionally
  // permissive to avoid blocking builds until the real package is installed.
  export type FieldValues = Record<string, any>;
  export type FieldPath<T> = keyof T & string;

  export type ControllerProps<TFieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = any;

  export const Controller: React.ComponentType<any>;
  export const FormProvider: React.ComponentType<any>;
  export function useFormContext(): any;
  export function useFormState(opts?: any): any;

  // export everything as any as fallback
  const _default: any;
  export default _default;
}
