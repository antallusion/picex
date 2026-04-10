'use client';
import { useReducer } from 'react';
import { Context } from './Context';
import { reducer } from './reducer/reducer';

export default function ContextProvider({ children = [] }) {
  const [state, dispatch] = useReducer(reducer, {
    allImages: [],
    checked: [],
    images: [],
    photosPage: false,
    loading: false,
    imagesHas: false,
    checkAll: false,
    pageUrl: '',
    activeFormat: '',
    errorMessage: '',
  });

  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
}
