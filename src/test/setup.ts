import '@testing-library/jest-dom';

// Ensure localStorage is polyfilled in test environment if needed
if (typeof window !== 'undefined' && !window.localStorage) {
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: 0,
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
  });
}
