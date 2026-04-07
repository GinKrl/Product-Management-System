import { render } from '@testing-library/react';
import { React } from 'react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';

const AllTheProviders = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export { customRender as render };
