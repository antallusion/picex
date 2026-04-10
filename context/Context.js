'use client';
import { createContext, useContext } from 'react';

export const Context = createContext(null);

export function useDispatch() {
  return useContext(Context).dispatch;
}

export function useSelection() {
  return useContext(Context).state;
}
