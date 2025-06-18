// content.js
// Injects link hover listeners and shows preview popup

(function() {
  let previewDiv = null;
  let lastUrl = null;
  let showTimeout = null;

  function createPreviewDiv() {
    if (document.getElementById('link-preview-popup')) {
      previewDiv = document.getElementById('link-preview-popup');
      return;
    }
    previewDiv = document.createElement('div');
    previewDiv.id = 'link-preview-popup';
    previewDiv.style.position = 'fixed';
    previewDiv.style.zIndex = 2147483647;
    previewDiv.style.background = '#fff';
    previewDiv.style.border = '1.5px solid #e0e0e0';
    previewDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    previewDiv.style.padding = '10px';
    previewDiv.style.maxWidth = '400px';
    previewDiv.style.maxHeight = '300px';
    previewDiv.style.overflow = 'auto';
    previewDiv.style.display = 'none';
    previewDiv.style.fontSize = '14px';
    previewDiv.style.pointerEvents = 'none';
    previewDiv.style.opacity = '0';
    previewDiv.style.transition = 'opacity 0.18s';
    document.body.appendChild(previewDiv);
  }

  function showPreview(e, url) {
    clearTimeout(showTimeout);
    showTimeout = setTimeout(() => {
      // Calculate position to avoid going off-screen
      let left = e.pageX + 15;
      let top = e.pageY + 15;
      const popupWidth = 400;
      const popupHeight = 300;
      if (left + popupWidth > window.innerWidth) left = window.innerWidth - popupWidth - 10;
      if (top + popupHeight > window.innerHeight) top = window.innerHeight - popupHeight - 10;
      previewDiv.style.left = left + 'px';
      previewDiv.style.top = top + 'px';
      previewDiv.style.display = 'block';
      setTimeout(() => { previewDiv.style.opacity = '1'; }, 10);
      previewDiv.innerHTML = 'Loading preview...';
      lastUrl = url;
      chrome.runtime.sendMessage({type: 'getPreview', url}, (response) => {
        if (url !== lastUrl) return;
        let statusColor = response.safe === false ? '#fff6f6' : '#f6fff6';
        let borderColor = response.safe === false ? '#f5b2b2' : '#b2e6b2';
        let textColor = response.safe === false ? '#c00' : '#1a7f1a';
        let icon = response.safe === false ? '⚠️' : '✔️';
        let html = `<div style='background:${statusColor};border:1.5px solid ${borderColor};padding:6px 10px 6px 8px;margin-bottom:10px;border-radius:6px;color:${textColor};font-weight:500;display:flex;align-items:center;gap:6px;'>${icon} ${response.statusText}</div>`;
        if (response.preview) {
          html += `<div style='border-top:1px solid #ececec;padding-top:8px;margin-top:6px;'>${response.preview}</div>`;
        } else if (response.error) {
          html += `<div style='color:#c00;font-size:13px;'>Preview unavailable: ${response.error}</div>`;
        } else {
          html += '<div style="color:#888">Could not load preview.</div>';
        }
        previewDiv.innerHTML = `<div style='font-family:Segoe UI,Arial,sans-serif;max-width:380px;background:#fff;border-radius:10px;border:1.5px solid #e0e0e0;box-shadow:0 2px 8px rgba(0,0,0,0.06);padding:16px 16px 10px 16px;'>${html}</div>`;
        // Save for popup
        chrome.storage.local.set({
          lastPreview: {
            safe: response.safe,
            statusText: response.statusText,
            title: response.title,
            description: response.description,
            image: response.image,
            url: response.url,
            error: response.error
          }
        });
      });
    }, 180);
  }

  function hidePreview() {
    clearTimeout(showTimeout);
    if (previewDiv) {
      previewDiv.style.opacity = '0';
      setTimeout(() => {
        if (previewDiv) previewDiv.style.display = 'none';
      }, 180);
    }
    lastUrl = null;
  }

  function addListeners() {
    document.body.addEventListener('mouseover', function(e) {
      const a = e.target.closest('a[href]');
      if (a) {
        showPreview(e, a.href);
      }
    });
    document.body.addEventListener('mousemove', function(e) {
      if (previewDiv && previewDiv.style.display === 'block') {
        // Calculate position to avoid going off-screen
        let left = e.pageX + 15;
        let top = e.pageY + 15;
        const popupWidth = 400;
        const popupHeight = 300;
        if (left + popupWidth > window.innerWidth) left = window.innerWidth - popupWidth - 10;
        if (top + popupHeight > window.innerHeight) top = window.innerHeight - popupHeight - 10;
        previewDiv.style.left = left + 'px';
        previewDiv.style.top = top + 'px';
      }
    });
    document.body.addEventListener('mouseout', function(e) {
      if (e.target.closest('a[href]')) {
        hidePreview();
      }
    });
    // Remove popup on page navigation
    window.addEventListener('beforeunload', () => {
      if (previewDiv) previewDiv.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createPreviewDiv();
      addListeners();
    });
  } else {
    createPreviewDiv();
    addListeners();
  }
})();
