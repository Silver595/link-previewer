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
  });
});
