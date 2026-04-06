// ─────────────────────────────────────────────────────────────────
//  Dominate Law — Cookie Consent Banner
//  Include this file on every page: <script src="/js/cookie-consent.js"></script>
//  Stores preference in localStorage under 'dl_cookie_consent'
//  Values: 'accepted' | 'declined'
// ─────────────────────────────────────────────────────────────────

(function () {
  var STORAGE_KEY = 'dl_cookie_consent';

  // Already decided — do nothing
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Inject styles
  var style = document.createElement('style');
  style.textContent = `
    #dl-cookie-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 9000;
      background: #1a0800;
      border-top: 1px solid rgba(232,196,74,.25);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: .82rem;
      color: rgba(255,255,255,.75);
      box-shadow: 0 -4px 32px rgba(0,0,0,.35);
      transform: translateY(100%);
      transition: transform .4s cubic-bezier(.4,0,.2,1);
    }
    #dl-cookie-banner.dl-cb-visible {
      transform: translateY(0);
    }
    #dl-cookie-banner p {
      margin: 0;
      flex: 1;
      min-width: 200px;
      line-height: 1.6;
      font-size: .82rem;
      color: rgba(255,255,255,.75);
    }
    #dl-cookie-banner a {
      color: #E8C44A;
      text-decoration: underline;
      text-decoration-color: rgba(232,196,74,.4);
    }
    #dl-cookie-banner a:hover { color: #fff; }
    .dl-cb-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .dl-cb-btn {
      padding: 9px 20px;
      border-radius: 5px;
      font-size: .8rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all .2s;
      white-space: nowrap;
    }
    .dl-cb-accept {
      background: #C49A0A;
      color: #fff;
    }
    .dl-cb-accept:hover { background: #9E7C08; }
    .dl-cb-decline {
      background: transparent;
      color: rgba(255,255,255,.45);
      border: 1px solid rgba(255,255,255,.15);
    }
    .dl-cb-decline:hover {
      color: rgba(255,255,255,.75);
      border-color: rgba(255,255,255,.35);
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  var banner = document.createElement('div');
  banner.id = 'dl-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <p>
      We use cookies to analyse site traffic and improve your experience.
      By clicking <strong>Accept</strong> you consent to our use of cookies.
      See our <a href="/privacy-policy">Privacy Policy</a> for details.
    </p>
    <div class="dl-cb-actions">
      <button class="dl-cb-btn dl-cb-decline" id="dl-cb-decline">Decline</button>
      <button class="dl-cb-btn dl-cb-accept" id="dl-cb-accept">Accept Cookies</button>
    </div>
  `;
  document.body.appendChild(banner);

  // Animate in after a short delay
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      banner.classList.add('dl-cb-visible');
    });
  });

  function dismissBanner(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) {}
    banner.classList.remove('dl-cb-visible');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 450);
  }

  document.getElementById('dl-cb-accept').addEventListener('click', function () {
    dismissBanner('accepted');
  });

  document.getElementById('dl-cb-decline').addEventListener('click', function () {
    dismissBanner('declined');
  });
})();
