"use client";

import { useState } from "react";

type InputValues = Record<string, string | number | boolean>;

export default function useInputs<T extends { [K in keyof T]: InputValues[string] }>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === 'checkbox' && 'checked' in e.target ? e.target.checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  return [values, onChange, setValues] as const;
}
