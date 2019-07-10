import React from 'react';


interface TestProps {
  id?: string;
}

export const Test = ({ id }: TestProps) => {
  return (
    <div>
      Test: {id}
      <p>
        <strong>Hello, World!</strong>
      </p>
    </div>
  );
};

export const KEY = 'TEST';
