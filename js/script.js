/**
 * ART ROYAL GARDEN - WEDDING INVITATION INTERACTIVE ENGINE
 * The Wedding of Gideon & Maria (22 . 10 . 2026)
 * Pure, Ultra-Fast Vanilla JavaScript
 */

(function () {
  'use strict';

  // Target Wedding Date: Kamis, 22 Oktober 2026, 10.00 WIB (UTC+7)
  const WEDDING_DATE = new Date('2026-10-22T10:00:00+07:00').getTime();

  // State
  let isMusicPlaying = false;
  let userManuallyPaused = false;

  // DOM Elements
  const coverModal = document.getElementById('eltemplate-cover');
  const btnOpenCover = document.getElementById('eltemplate-btnCover');
  const guestNameEl = document.getElementById('guest-name');
  const audioEl = document.getElementById('song');
  const audioContainer = document.getElementById('audio-container');
  const audioBtn = document.getElementById('audio-btn');
  const muteSoundIcon = document.getElementById('mute-sound');
  const unmuteSoundIcon = document.getElementById('unmute-sound');
  const heroVideo = document.getElementById('hero-video');

  // Gift Elements
  const btnShowGift = document.getElementById('btn-show-gift');
  const btnCloseGift = document.getElementById('btn-close-gift');
  const showGiftBox = document.getElementById('showgift-box');
  const copyButtons = document.querySelectorAll('.btn-copy');
  const toastNotification = document.getElementById('toast-notification');

  // Countdown Elements
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  // Lightbox Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const galleryItems = document.querySelectorAll('#gallery-grid .gallery-item');

  // RSVP & Wishes Elements
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpNameInput = document.getElementById('rsvp-name');
  const rsvpMessageInput = document.getElementById('rsvp-message');
  const rsvpStatusInput = document.getElementById('rsvp-status');
  const wishesListEl = document.getElementById('wishes-list');
  const wishesTotalCountEl = document.getElementById('wishes-total-count');
  const statCountHadirEl = document.getElementById('stat-count-hadir');
  const statCountAbsenEl = document.getElementById('stat-count-absen');

  // --------------------------------------------------------------------------
  // 1. Guest Name from URL Parameter (?to=... or ?u=...)
  // --------------------------------------------------------------------------
  function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  function initGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('to') || params.get('u') || params.get('guest') || params.get('nama') || params.get('name') || params.get('p');

    if (guestParam && guestParam.trim()) {
      const sanitized = sanitizeHTML(decodeURIComponent(guestParam.trim()));
      if (guestNameEl) guestNameEl.textContent = sanitized;
      if (rsvpNameInput) rsvpNameInput.value = sanitized;
    } else {
      if (guestNameEl) guestNameEl.textContent = 'Tamu Undangan';
    }

    // Auto open if parameter ?opened=1 or specific hash present
    if (params.get('opened') === '1' || window.location.hash.includes('opened')) {
      openInvitation();
    }
  }

  // --------------------------------------------------------------------------
  // 2. Open Invitation Action
  // --------------------------------------------------------------------------
  function openInvitation() {
    // Unlock body scroll
    document.body.classList.remove('scroll-locked');

    // Fade out cover modal
    if (coverModal) {
      coverModal.classList.add('fade-out');
      setTimeout(() => {
        coverModal.style.display = 'none';
      }, 800);
    }

    // Play Background Audio
    playAudio();

    // Play Hero Video
    if (heroVideo) {
      heroVideo.play().catch(e => {
        console.warn('Hero video autoplay blocked:', e);
      });
    }

    // Trigger scroll reveal check
    checkScrollReveal();
  }

  // --------------------------------------------------------------------------
  // 3. Audio Controller
  // --------------------------------------------------------------------------
  function playAudio() {
    if (!audioEl) return;
    audioEl.play().then(() => {
      isMusicPlaying = true;
      userManuallyPaused = false;
      updateAudioUI(true);
    }).catch(err => {
      console.warn('Audio play request blocked or failed:', err);
      updateAudioUI(false);
    });
  }

  function pauseAudio() {
    if (!audioEl) return;
    audioEl.pause();
    isMusicPlaying = false;
    updateAudioUI(false);
  }

  function toggleAudio() {
    if (isMusicPlaying) {
      pauseAudio();
      userManuallyPaused = true;
    } else {
      playAudio();
      userManuallyPaused = false;
    }
  }

  function updateAudioUI(playing) {
    if (!audioBtn) return;
    if (playing) {
      audioBtn.classList.add('playing');
      if (muteSoundIcon) muteSoundIcon.style.display = 'block';
      if (unmuteSoundIcon) unmuteSoundIcon.style.display = 'none';
    } else {
      audioBtn.classList.remove('playing');
      if (muteSoundIcon) muteSoundIcon.style.display = 'none';
      if (unmuteSoundIcon) unmuteSoundIcon.style.display = 'block';
    }
  }

  // Pause on background tab, resume when user returns
  document.addEventListener('visibilitychange', () => {
    if (!audioEl) return;
    if (document.visibilityState === 'hidden') {
      if (isMusicPlaying) {
        audioEl.pause();
      }
    } else if (document.visibilityState === 'visible') {
      if (!userManuallyPaused && isMusicPlaying) {
        audioEl.play().catch(() => {});
      }
    }
  });

  // --------------------------------------------------------------------------
  // 4. Countdown Timer
  // --------------------------------------------------------------------------
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance <= 0) {
      if (cdDays) cdDays.textContent = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMinutes) cdMinutes.textContent = '00';
      if (cdSeconds) cdSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  // --------------------------------------------------------------------------
  // 5. Wedding Gift Accordion Toggle
  // --------------------------------------------------------------------------
  function setupGiftToggle() {
    if (btnShowGift && showGiftBox && btnCloseGift) {
      btnShowGift.addEventListener('click', () => {
        showGiftBox.classList.add('active');
        btnShowGift.style.display = 'none';
        btnCloseGift.style.display = 'inline-flex';
      });

      btnCloseGift.addEventListener('click', () => {
        showGiftBox.classList.remove('active');
        btnCloseGift.style.display = 'none';
        btnShowGift.style.display = 'inline-flex';
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. Copy to Clipboard with Toast Notification
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message || 'Berhasil disalin ke clipboard!';
    toastNotification.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  function fallbackCopyText(text, label) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      showToast(`${label} berhasil disalin!`);
    } catch (err) {
      showToast('Gagal menyalin teks.');
    }
    document.body.removeChild(textArea);
  }

  function setupCopyButtons() {
    copyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy') || '';
        const label = btn.getAttribute('data-label') || 'Teks';

        if (!textToCopy) return;

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`${label} berhasil disalin!`);
          }).catch(() => {
            fallbackCopyText(textToCopy, label);
          });
        } else {
          fallbackCopyText(textToCopy, label);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. Gallery Lightbox
  // --------------------------------------------------------------------------
  function openLightbox(src) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
  }

  function setupGalleryLightbox() {
    const items = document.querySelectorAll('#gallery-grid .gallery-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src') || item.querySelector('img')?.src;
        if (src) openLightbox(src);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. RSVP & Wishes Stream (Local Storage & Google Sheets Database)
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'gideon_maria_wedding_wishes';

  // URL Google Apps Script Web App untuk sinkronisasi Google Sheets
  const GOOGLE_SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxIhP9JKkdMrtOeAtKGLjiAWNF9hE6b79r874WyzyIqcA0955WTVgKOTD15ip7fwy3eiA/exec';

  const INITIAL_WISHES = [
    {
      name: 'Pdt. Andreas Warsito & Keluarga',
      status: 'Hadir',
      message: 'Selamat memasuki pernikahan kudus Gideon & Maria. Kiranya damai sejahtera Kristus dan kasih karunia-Nya senantiasa melimpah memenuhi bahtera rumah tangga kalian. Apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia. Tuhan Yesus memberkati selalu!',
      timestamp: Date.now() - 3600 * 1000 * 2 // 2 hours ago
    },
    {
      name: 'Keluarga Besar Bpk. Narsi',
      status: 'Hadir',
      message: 'Selamat berbahagia untuk Dion dan Maria! Doa kami menyertai perjalanan hidup baru kalian, semoga senantiasa rukun, saling mengasihi, dan menjadi saksi kasih Kristus yang indah.',
      timestamp: Date.now() - 3600 * 1000 * 7 // 7 hours ago
    },
    {
      name: 'Sahabat Pemuda Gereja',
      status: 'Hadir',
      message: 'Happy Holy Matrimony Gideon & Maria! Terharu melihat perjalanan kasih kalian hingga sampai di altar kudus Tuhan. Tetap setia, saling melengkapi, dan bahagia selamanya!',
      timestamp: Date.now() - 3600 * 1000 * 18 // 18 hours ago
    },
    {
      name: 'Stephanus & Ester',
      status: 'Hadir',
      message: 'Selamat menempuh hidup baru Dion & Maria! Tali tiga lembar tak mudah diputuskan. Kiranya Tuhan senantiasa menjadi pusat dalam setiap langkah rumah tangga kalian. Congrats!',
      timestamp: Date.now() - 3600 * 1000 * 30 // 1.2 days ago
    },
    {
      name: 'Rico & Tim Second Hope',
      status: 'Hadir',
      message: 'Congratulations on your wedding day Dion & Maria! Sangat bersukacita bisa menjadi bagian dari hari bahagia kalian. Sukses dan diberkati selalu!',
      timestamp: Date.now() - 3600 * 1000 * 48 // 2 days ago
    }
  ];

  let wishesData = [];

  function loadWishes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        wishesData = JSON.parse(stored);
      } else if (!GOOGLE_SHEET_ENDPOINT) {
        wishesData = [...INITIAL_WISHES];
        saveWishes();
      } else {
        wishesData = [];
      }
    } catch (e) {
      console.warn('Failed to parse wishes from localStorage:', e);
      wishesData = [];
    }
    renderWishes();

    // Jika URL Google Sheet sudah dipasang, ambil data live terbaru
    if (GOOGLE_SHEET_ENDPOINT && GOOGLE_SHEET_ENDPOINT.trim() !== '') {
      fetchWishesFromGoogleSheet();
    }
  }

  async function fetchWishesFromGoogleSheet() {
    try {
      // Tambahkan timestamp anti-cache agar browser selalu mengambil data paling baru dari Sheet
      const sep = GOOGLE_SHEET_ENDPOINT.includes('?') ? '&' : '?';
      const urlWithTime = `${GOOGLE_SHEET_ENDPOINT}${sep}_t=${Date.now()}`;
      const res = await fetch(urlWithTime);
      const json = await res.json();
      if (json && json.result === 'success' && Array.isArray(json.data)) {
        // Sinkronisasi penuh dengan Google Sheet (jika data dihapus di Sheet, maka website ikut bersih)
        wishesData = json.data;
        saveWishes();
        renderWishes();
      }
    } catch (err) {
      console.warn('Google Sheet fetch error (fallback to local cache):', err);
    }
  }

  function saveWishes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishesData));
    } catch (e) {
      console.warn('Failed to save wishes to localStorage:', e);
    }
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Baru saja';
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);

    if (elapsed < 60) return 'Baru saja';
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)} menit yang lalu`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)} jam yang lalu`;
    return `${Math.floor(elapsed / 86400)} hari yang lalu`;
  }

  function renderWishes() {
    if (!wishesListEl) return;
    wishesListEl.innerHTML = '';

    let countHadir = 0;
    let countAbsen = 0;

    if (wishesData.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'wishes-empty-note';
      emptyNote.style.cssText = 'padding: 24px 15px; text-align: center; color: rgba(255, 255, 255, 0.8); font-style: italic; font-size: 13.5px;';
      emptyNote.textContent = 'Belum ada ucapan. Jadilah yang pertama memberikan doa restu bagi kedua mempelai!';
      wishesListEl.appendChild(emptyNote);
    } else {
      wishesData.forEach(item => {
        if (item.status === 'Hadir') countHadir++;
        if (item.status === 'Tidak Hadir') countAbsen++;

        const card = document.createElement('div');
        card.className = 'wish-comment-card';

        // Avatar Initial
        const initial = (item.name || 'G').trim().charAt(0).toUpperCase();

        // Badge Class
        let badgeClass = 'badge-hadir';
        if (item.status === 'Tidak Hadir') badgeClass = 'badge-absen';
        if (item.status === 'Masih Ragu') badgeClass = 'badge-ragu';

        card.innerHTML = `
          <div class="wish-avatar">${initial}</div>
          <div class="wish-body">
            <div class="wish-author">
              <span>${sanitizeHTML(item.name)}</span>
              <span class="wish-badge ${badgeClass}">${sanitizeHTML(item.status || 'Hadir')}</span>
            </div>
            <div class="wish-time">${formatTimeAgo(item.timestamp)}</div>
            <p class="wish-text">${sanitizeHTML(item.message)}</p>
          </div>
        `;
        wishesListEl.appendChild(card);
      });
    }

    if (wishesTotalCountEl) wishesTotalCountEl.textContent = String(wishesData.length);
    if (statCountHadirEl) statCountHadirEl.textContent = String(countHadir);
    if (statCountAbsenEl) statCountAbsenEl.textContent = String(countAbsen);
  }

  function setupRSVPForm() {
    if (!rsvpForm) return;

    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = rsvpNameInput ? rsvpNameInput.value.trim() : '';
      const message = rsvpMessageInput ? rsvpMessageInput.value.trim() : '';
      const status = rsvpStatusInput ? rsvpStatusInput.value : '';
      const submitBtn = document.getElementById('btn-rsvp-submit');

      if (!name) {
        showToast('Mohon masukkan nama Anda');
        if (rsvpNameInput) rsvpNameInput.focus();
        return;
      }

      if (!message) {
        showToast('Mohon tuliskan doa atau ucapan Anda');
        if (rsvpMessageInput) rsvpMessageInput.focus();
        return;
      }

      if (!status) {
        showToast('Mohon pilih konfirmasi kehadiran');
        if (rsvpStatusInput) rsvpStatusInput.focus();
        return;
      }

      const newEntry = {
        name: name,
        message: message,
        status: status,
        timestamp: Date.now()
      };

      // Tampilkan seketika di halaman (Optimistic UI)
      wishesData.unshift(newEntry);
      saveWishes();
      renderWishes();

      if (rsvpMessageInput) rsvpMessageInput.value = '';
      showToast('Terima kasih atas doa dan ucapan berkat Anda!');

      // Kirim ke Google Sheets jika endpoint sudah dipasang
      if (GOOGLE_SHEET_ENDPOINT && GOOGLE_SHEET_ENDPOINT.trim() !== '') {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Menyimpan ke Sheet...';
        }

        fetch(GOOGLE_SHEET_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(newEntry)
        })
          .then(() => {
            console.log('Ucapan berhasil tersimpan ke Google Sheets');
          })
          .catch((err) => {
            console.warn('Gagal sinkron ke Google Sheets:', err);
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Kirim Doa Restu';
            }
          });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. Scroll Reveal Animations (IntersectionObserver)
  // --------------------------------------------------------------------------
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      reveals.forEach(el => observer.observe(el));
    } else {
      window.addEventListener('scroll', checkScrollReveal, { passive: true });
      checkScrollReveal();
    }
  }

  function checkScrollReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.active)');
    const windowHeight = window.innerHeight;

    reveals.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < windowHeight - 50) {
        el.classList.add('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // Document Ready Initialization
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Guest Name
    initGuestName();

    // 2. Open Invitation Button
    if (btnOpenCover) {
      btnOpenCover.addEventListener('click', openInvitation);
    }

    // 3. Audio Controller
    if (audioBtn) {
      audioBtn.addEventListener('click', toggleAudio);
    }

    // 4. Gift Accordion
    setupGiftToggle();

    // 5. Copy Buttons
    setupCopyButtons();

    // 6. Gallery Lightbox
    setupGalleryLightbox();

    // 7. Countdown Timer
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 8. RSVP & Wishes
    loadWishes();
    setupRSVPForm();

    // 9. Scroll Reveal
    initScrollReveal();
  });

})();
