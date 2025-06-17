// content.js
// Injects link hover listeners and shows preview popup

(function() {
  let previewDiv = null;
  let lastUrl = null;

  function createPreviewDiv() {
    previewDiv = document.createElement('div');
    previewDiv.id = 'link-preview-popup';
    previewDiv.style.position = 'fixed';
    previewDiv.style.zIndex = 99999;
    previewDiv.style.background = '#fff';
    previewDiv.style.border = '1px solid #ccc';
    previewDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    previewDiv.style.padding = '10px';
    previewDiv.style.maxWidth = '400px';
    previewDiv.style.maxHeight = '300px';
    previewDiv.style.overflow = 'auto';
    previewDiv.style.display = 'none';
    previewDiv.style.fontSize = '14px';
    document.body.appendChild(previewDiv);
  }

  function showPreview(e, url) {
    previewDiv.style.left = e.pageX + 15 + 'px';
    previewDiv.style.top = e.pageY + 15 + 'px';
    previewDiv.style.display = 'block';
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
  }

  function extractTitle(html) {
    const m = html && html.match(/<b>(.*?)<\/b>/i);
    return m ? m[1] : '';
  }
  function extractDescription(html) {
    const m = html && html.match(/<i>(.*?)<\/i>/i);
    return m ? m[1] : '';
  }
  function extractImage(html) {
    const m = html && html.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
    return m ? m[1] : '';
  }

  function hidePreview() {
    previewDiv.style.display = 'none';
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
      if (previewDiv.style.display === 'block') {
        previewDiv.style.left = e.pageX + 15 + 'px';
        previewDiv.style.top = e.pageY + 15 + 'px';
      }
    });
    document.body.addEventListener('mouseout', function(e) {
      if (e.target.closest('a[href]')) {
        hidePreview();
      }
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
