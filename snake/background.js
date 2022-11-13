/**
 * Listens for the app launching then creates the window
 *
 * @see /apps/app.window.html
 */
 chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {
      id: 'main',
      bounds: { width: 620, height: 500 }
    });
  });