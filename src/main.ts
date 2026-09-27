import './style.css';
import { Game } from './game/game';

function init() {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    new Game(appContainer);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
