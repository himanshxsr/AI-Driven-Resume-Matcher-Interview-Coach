"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ACCEPT = "application/pdf";
const MAX_SIZE_MB = 5;

export interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  error,
  disabled,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }
    if (file.type !== ACCEPT) {
      onChange(null);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onChange(null);
      return;
    }
    onChange(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    handleFile(file ?? null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    e.target.value = "";
  };

  const openPicker = () => inputRef.current?.click();
  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card
      className={cn(
        "transition-colors",
        isDragging && "border-primary bg-primary/5",
        error && "border-destructive",
        className
      )}
    >
      <CardContent className="pt-6">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="Upload resume PDF"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={disabled ? undefined : openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer",
            "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
            disabled && "pointer-events-none opacity-60"
          )}
          aria-label="Drop PDF here or click to browse"
        >
          {value ? (
            <>
              <p className="text-sm font-medium text-foreground">
                {value.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(value.size / 1024).toFixed(1)} KB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                disabled={disabled}
                className="mt-2"
              >
                Clear
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                Drop your resume PDF here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Max {MAX_SIZE_MB} MB, PDF only
              </p>
            </>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
