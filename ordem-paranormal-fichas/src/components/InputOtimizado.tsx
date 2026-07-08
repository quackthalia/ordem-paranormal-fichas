import React, { useState, useEffect, useCallback } from 'react';

interface InputOtimizadoProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  debounce?: number;
}

export const InputOtimizado: React.FC<InputOtimizadoProps> = ({
  value,
  onChange,
  placeholder,
  style,
  debounce = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        if (newValue !== value) onChange(newValue);
      }, debounce);
    },
    [value, onChange, debounce]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      style={style}
    />
  );
};