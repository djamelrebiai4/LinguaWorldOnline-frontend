(function () {
  'use strict';

  const path = window.location.pathname;
  if (path === '/' || path.endsWith('/index.html')) {
    window.location.replace('/levels/city.html');
  }
})();
