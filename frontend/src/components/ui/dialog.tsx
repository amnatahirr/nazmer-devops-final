"use client";

import React from "react";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children: ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children: ReactNode;
}

interface DialogFooterProps {
  className?: string;
  children: ReactNode;
}

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50 w-full max-w-lg mx-4">{children}</div>
    </div>
  );
};

const DialogContent = ({ className = "", children }: DialogContentProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

const DialogHeader = ({ className = "", children }: DialogHeaderProps) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ className = "", children }: DialogTitleProps) => {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
};

const DialogDescription = ({
  className = "",
  children,
}: DialogDescriptionProps) => {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
};

const DialogTrigger = ({
  children,
  asChild = false,
  onClick,
}: DialogTriggerProps) => {
  if (
    asChild &&
    typeof children === "object" &&
    children !== null &&
    "props" in children
  ) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (e: any) => {
        children.props.onClick?.(e);
        onClick?.();
      },
    });
  }

  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
};

const DialogClose = ({ className = "", children, ...props }: any) => {
  return (
    <button
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children || <X className="h-4 w-4" />}
    </button>
  );
};

const DialogFooter = ({ className = "", children }: DialogFooterProps) => {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    >
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
};
