import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './Layout/common/store';
import { Provider } from 'react-redux';
import SuspenseContent from './Layout/SuspenseContent';

const root = ReactDOM.createRoot(document.getElementById('root')); // Updated to use createRoot
root.render(
  <Suspense fallback={<SuspenseContent />}>
    <Provider store={store}>
      <App />
    </Provider>
  </Suspense>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
