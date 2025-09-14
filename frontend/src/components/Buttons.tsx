import type { ReactElement } from "react";

interface ButtonProps {
    variant: "primary" | "secondary";
    size: "sm" | "md" | "lg";
    text: string;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick: () => void;
}

const variantStyles = {
    "primary": "bg-purple-600 text-white rounded-xs",
    "secondary": "bg-purple-400 text-purple"
} 

const sizeStyles = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
}

const defaultStyles = "rounded-lg flex gap-2 items-center justify-center font-medium transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:ring-2  ";

export const Button = (props: ButtonProps) => {
    return <button className={`${variantStyles[props.variant]} ${defaultStyles} ${sizeStyles[props.size]} `}>{props.startIcon} {props.text}</button>
}

