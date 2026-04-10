'use client';
import ContextProvider from '@/context/ContextProvider';
import App from '@/components/App';

export default function Page() {
  return (
    <ContextProvider>
      <App />
    </ContextProvider>
  );
}

