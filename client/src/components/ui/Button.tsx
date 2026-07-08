import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "ghost" | "success";
export type ButtonSize = "md" | "sm";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children?: ReactNode;
}

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  block: boolean,
  className?: string
): string {
  return [
    styles.btn,
    styles[variant],
    size === "sm" && styles.sm,
    block && styles.block,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, size, block, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className">;

// Anchor styled as a button (for download links etc.).
export function LinkButton({
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a className={classes(variant, size, block, className)} {...rest}>
      {children}
    </a>
  );
}
