import React from 'react';


interface TestProps {
  id?: string;
}

export const Test = ({ id }: TestProps) => {
  return (
    <div>
      Test: {id}
    </div>
  );
};

export const KEY = 'TEST';
