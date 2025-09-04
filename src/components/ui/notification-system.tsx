import React from 'react';
import { Toaster } from 'sonner';

const NotificationSystem: React.FC = () => {
  // Temporarily simplified to prevent infinite loops
  // TODO: Re-implement notification system with proper state management

  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
    />
  );
};

export default NotificationSystem;
