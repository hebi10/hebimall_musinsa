"use client";

import { useState } from "react";

export default function useInputs(initialState: Record<string, any> = {}) {
  const [values, setValues] = useState(initialState);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return [values, onChange, setValues] as const;
}
