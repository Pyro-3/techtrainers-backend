import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    disabled = false,
    className = ''
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
        secondary: 'bg-stone-200 text-stone-800 hover:bg-stone-300 focus:ring-stone-500',
        ghost: 'text-stone-600 hover:text-stone-800 hover:bg-stone-100 focus:ring-stone-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={classes}
        >
            {Icon && iconPosition === 'left' && (
                <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
                <Icon className={`w-4 h-4 ${children ? 'ml-2' : ''}`} />
            )}
        </button>
    );
};

export default Button;
