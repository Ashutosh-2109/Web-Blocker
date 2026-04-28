document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const timeInput = document.getElementById('time-input');
  const blockBtn = document.getElementById('block-btn');
  const blockList = document.getElementById('block-list');

  // Load existing blocks
  loadBlocks();

  blockBtn.addEventListener('click', () => {
    let domain = urlInput.value.trim().toLowerCase();
    const timeVal = parseInt(timeInput.value.trim());

    if (!domain || isNaN(timeVal) || timeVal <= 0) {
      alert('Please enter a valid URL and time in minutes.');
      return;
    }

    try {
      if (!domain.startsWith('http')) {
        domain = 'https://' + domain;
      }
      const urlObj = new URL(domain);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
      alert('Invalid URL format.');
      return;
    }

    const unblockTime = Date.now() + (timeVal * 60 * 1000);

    chrome.storage.local.get(['blockedSites'], (result) => {
      let blockedSites = result.blockedSites || [];
      
      const existingIdx = blockedSites.findIndex(s => s.domain === domain);
      if (existingIdx !== -1) {
        blockedSites[existingIdx].unblockTime = unblockTime;
      } else {
        blockedSites.push({ domain, unblockTime });
      }

      chrome.storage.local.set({ blockedSites }, () => {
        urlInput.value = '';
        timeInput.value = '';
        loadBlocks();
      });
    });
  });

  function loadBlocks() {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      const now = Date.now();
      
      const activeBlocks = blockedSites.filter(site => site.unblockTime > now);
      
      if (activeBlocks.length !== blockedSites.length) {
        chrome.storage.local.set({ blockedSites: activeBlocks });
      }

      renderList(activeBlocks);
    });
  }

  function renderList(sites) {
    blockList.innerHTML = '';
    
    if (sites.length === 0) {
      blockList.innerHTML = '<div class="empty-state">No active blocks</div>';
      return;
    }

    sites.forEach(site => {
      const li = document.createElement('li');
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'site-info';
      
      const domainSpan = document.createElement('span');
      domainSpan.className = 'domain';
      domainSpan.textContent = site.domain;
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'time-left';
      
      const minsLeft = Math.ceil((site.unblockTime - Date.now()) / 60000);
      timeSpan.textContent = `${minsLeft} min${minsLeft !== 1 ? 's' : ''} left`;
      
      infoDiv.appendChild(domainSpan);
      infoDiv.appendChild(timeSpan);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Unblock';
      removeBtn.onclick = () => removeBlock(site.domain);
      
      li.appendChild(infoDiv);
      li.appendChild(removeBtn);
      blockList.appendChild(li);
    });
  }

  function removeBlock(domain) {
    chrome.storage.local.get(['blockedSites'], (result) => {
      let blockedSites = result.blockedSites || [];
      blockedSites = blockedSites.filter(s => s.domain !== domain);
      chrome.storage.local.set({ blockedSites }, () => {
        loadBlocks();
      });
    });
  }

  setInterval(loadBlocks, 60000);
});
