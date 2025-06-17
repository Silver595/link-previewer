// background.js
// Handles preview fetching and link safety check

const VIRUSTOTAL_API_KEY = ''; // <-- Insert your VirusTotal API key
const LINKPREVIEW_API_KEY = ''; // <-- Insert your LinkPreview API key

async function checkLinkSafety(url) {
  // VirusTotal API v3: https://developers.virustotal.com/reference/url-info
  try {
    const urlId = btoa(url).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    const resp = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });
    if (!resp.ok) return { safe: true };
    const data = await resp.json();
    // If any engine flags as malicious, mark as unsafe
    const stats = data.data.attributes.last_analysis_stats;
    if (stats.malicious > 0 || stats.suspicious > 0) {
      return { safe: false };
    }
    return { safe: true };
  } catch (e) {
    return { safe: true }; // On error, default to safe
  }
}

async function fetchPreview(url) {
  // LinkPreview API: https://www.linkpreview.net/
  try {
    const resp = await fetch(`https://api.linkpreview.net/?key=${LINKPREVIEW_API_KEY}&q=${encodeURIComponent(url)}`);
    if (!resp.ok) return { error: 'API request failed' };
    const data = await resp.json();
    if (data.error) return { error: data.error };
    // Show title, description, and image if available
    let html = `<b>${data.title}</b><br><small>${data.url}</small>`;
    if (data.image) html += `<br><img src='${data.image}' style='max-width:100%;max-height:120px;'>`;
    if (data.description) html += `<br><i>${data.description}</i>`;
    return { html, ...data };
  } catch (e) {
    return { error: e.message };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'getPreview') {
    (async () => {
      const safety = await checkLinkSafety(msg.url);
      const preview = await fetchPreview(msg.url);
      let statusText = 'Unknown';
      if (safety.safe === false) statusText = 'Malicious!';
      else if (safety.safe === true) statusText = 'Safe';
      sendResponse({
        safe: safety.safe,
        statusText,
        preview: preview && preview.html ? preview.html : null,
        title: preview && preview.title ? preview.title : '',
        description: preview && preview.description ? preview.description : '',
        image: preview && preview.image ? preview.image : '',
        url: preview && preview.url ? preview.url : msg.url,
        error: preview && preview.error ? preview.error : null
      });
    })();
    return true; // async
  }
});
