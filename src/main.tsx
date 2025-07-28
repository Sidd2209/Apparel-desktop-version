import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';

// Set up Apollo Client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    },
  },
  connectToDevTools: true,
});

// Note: Apollo Client errors will be handled in individual components

const queryClient = new QueryClient();

console.log("VITE_API_URL in Tauri:", import.meta.env.VITE_API_URL);
console.log("Apollo Client URI:", import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql');
console.log("Environment variables:", import.meta.env);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);