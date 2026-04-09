import React, { useEffect, useState } from "react";
import { useDispatch, useSelection } from "../../context/Context";
import { SORT } from "../../context/reducer/actions";

function Find() {
  const [value, setValue] = useState("");
  const dispatch = useDispatch()
  const { loading } = useSelection();
  useEffect(() => {
dispatch({ type: SORT, value });
  }, [value]);

  useEffect(() => {
    if (value.length) {
      setValue("");
    }
  }, [loading]);
  return (
    <input
      className="form__input"
      placeholder="Я хочу найти..."
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    />
  );
}

export default Find;
