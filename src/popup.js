// popup.js
// For future popup UI logic
// Display preview and safety status from storage

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['lastPreview'], (result) => {
    const data = result.lastPreview;
    if (!data) return;
    // Set status
    const statusDiv = document.getElementById('popup-status');
    const statusText = document.getElementById('status-text');
    if (data.safe === false) {
      statusDiv.classList.remove('safe');
      statusDiv.classList.add('unsafe');
      statusText.textContent = data.statusText || 'Malicious!';
    } else {
      statusDiv.classList.remove('unsafe');
      statusDiv.classList.add('safe');
      statusText.textContent = data.statusText || 'Safe';
    }
    // Set preview
    document.getElementById('preview-title').textContent = data.title || '';
    document.getElementById('preview-desc').textContent = data.description || '';
    document.getElementById('preview-url').textContent = data.url || '';
    const img = document.getElementById('preview-img');
    if (data.image) {
      img.src = data.image;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
    // Show error if preview failed
    if (data.error) {
      document.getElementById('preview-title').textContent = 'Preview unavailable';
      document.getElementById('preview-desc').textContent = data.error;
      img.style.display = 'none';
    }
    // HTTPS/HTTP status
    const httpsStatus = document.getElementById('https-status');
    if (data.url && data.url.startsWith('https://')) {
      httpsStatus.textContent = 'HTTPS';
      httpsStatus.className = 'https';
    } else if (data.url && data.url.startsWith('http://')) {
      httpsStatus.textContent = 'HTTP';
      httpsStatus.className = 'http';
    } else {
      httpsStatus.textContent = '';
      httpsStatus.className = '';
    }
    // Domain reputation (simple logic: .gov/.edu = popular, .xyz/.top = suspicious, else new)
    const domainRep = document.getElementById('domain-reputation');
    if (data.url) {
      try {
        const domain = new URL(data.url).hostname;
        if (/\.(gov|edu|com|org|net)$/i.test(domain)) {
          domainRep.textContent = 'Popular';
          domainRep.className = 'popular';
        } else if (/\.(xyz|top|click|info)$/i.test(domain)) {
          domainRep.textContent = 'Suspicious';
          domainRep.className = 'suspicious';
        } else {
          domainRep.textContent = 'New';
          domainRep.className = 'new';
        }
      } catch {
        domainRep.textContent = '';
        domainRep.className = '';
      }
    } else {
      domainRep.textContent = '';
      domainRep.className = '';
    }
  });

  // Dark mode toggle
  const card = document.getElementById('popup-card');
  const toggle = document.getElementById('dark-toggle');
  let dark = false;
  toggle.addEventListener('click', () => {
    dark = !dark;
    if (dark) {
      card.classList.add('dark');
      toggle.textContent = '☀️';
    } else {
      card.classList.remove('dark');
      toggle.textContent = '🌙';
    }
  });
});
