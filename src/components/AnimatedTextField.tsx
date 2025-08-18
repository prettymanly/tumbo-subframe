"use client";

import React, { useState } from 'react';
import { TextField } from "@/components/subframe/ui/components/TextField";
import { useAnimatedPlaceholder } from './AnimatedSearchPlaceholder';
import { FeatherSearch } from "@subframe/core";

interface AnimatedTextFieldProps {
  phrases: string[];
  label?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => void;
  icon?: React.ReactNode;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export const AnimatedTextField: React.FC<AnimatedTextFieldProps> = ({
  phrases,
  label,
  className = "",
  value = "",
  onChange,
  onSubmit,
  icon = <FeatherSearch />,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000
}) => {
  const [inputValue, setInputValue] = useState(value);
  const animatedPlaceholder = useAnimatedPlaceholder(phrases, {
    typingSpeed,
    deletingSpeed,
    pauseTime
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(inputValue);
    }
  };

  return (
    <TextField
      label={label}
      className={className}
      icon={icon}
    >
      <TextField.Input
        placeholder={animatedPlaceholder}
        value={inputValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
    </TextField>
  );
};



