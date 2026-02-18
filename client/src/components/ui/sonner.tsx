"use client";

import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  return (
    <Sonner
      position="top-center"
      richColors
      toastOptions={{
        style: {
          zIndex: 9999,
        },
      }}
    />
  );
};

export { Toaster };