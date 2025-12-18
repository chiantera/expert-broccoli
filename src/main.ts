import './style.css';
import { initApp } from './app';

document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('app');
  if (!mount) {
    throw new Error('Unable to find #app root element');
  }
  initApp(mount);
});
