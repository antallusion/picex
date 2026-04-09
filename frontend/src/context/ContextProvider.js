import React, { useReducer } from "react";
import { Context } from "./Context";
import { reducer } from "./reducer/reducer";

function ContextProvider({ children = [], ...props }) {
  const [state, dispatch] = useReducer(reducer, {
    allImages: [],
    checked:[],
    images: [],
    photosPage:false,
    loading: false,
    imagesHas: false,
    checkAll:false,
    pageUrl:'',
    activeFormat:'',
    errorMessage:''
  });
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}

export default ContextProvider;
