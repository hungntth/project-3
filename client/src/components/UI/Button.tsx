import React from 'react';
import clsx from 'clsx';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}) => {
  return (
    <button 
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="btn-loader"></span> : children}
    </button>
  );
};

export default Button;
