"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "default",
  className = "",
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} ${className}`}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="py-4">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

// Confirmation Modal Component
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass =
    variant === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      }
    />
  );
}
