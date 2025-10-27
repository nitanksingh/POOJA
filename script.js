// script.js
document.documentElement.style.touchAction = 'manipulation';

const ambience = document.getElementById('ambience');
const sunMsg = document.getElementById('sunMsg');
const sunText = document.getElementById('sunText');
const sunClose = document.getElementById('sunClose');
const audioControl = document.getElementById('audioControl');
const audioTooltip = document.querySelector('.audio-tooltip');
const diyas = Array.from(document.querySelectorAll('.diya'));
const audioIcon = document.getElementById('audioIcon');

// comfortable starting volume
if (ambience) ambience.volume = 0.62;

// update the play/pause icon and aria
function updateIconState(isPlaying){
  const svg = audioControl.querySelector('svg');
  if(!svg) return;
  svg.innerHTML = isPlaying ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>' : '<path d="M8 5v14l11-7z"></path>';
  audioControl.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
  audioControl.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
  audioTooltip.textContent = isPlaying ? 'Pause music' : 'Play music';
}

// enable audio after first user interaction (to satisfy mobile autoplay policies)
function enableAudioOnFirstInteraction(){
  if(!ambience) return;
  ambience.play().then(()=> {
    ambience.muted = false;
    updateIconState(true);
  }).catch(()=> {
    // blocked: user can use control
  });
  window.removeEventListener('pointerdown', enableAudioOnFirstInteraction);
  window.removeEventListener('touchstart', enableAudioOnFirstInteraction);
}
window.addEventListener('pointerdown', enableAudioOnFirstInteraction, {passive:true});
window.addEventListener('touchstart', enableAudioOnFirstInteraction, {passive:true});

// audio control toggle

const playBtn = document.getElementById("playBtn");
const audio = document.getElementById("audio");

playBtn.addEventListener("click", async () => {
  try {
    // Try playing immediately
    await audio.play();
    playBtn.textContent = "🎶 Playing...";
    playBtn.disabled = true;
  } catch (err) {
    // If blocked, prompt user to tap again
    console.warn("Audio playback blocked:", err);
    playBtn.textContent = "Tap again to allow sound 🔁";
  }
});

// Helpful: log if audio file fails to load
audio.addEventListener("error", () => {
  alert("⚠️ Audio file not found! Please check the filename or move the .mp3 next to index.html");
});


// highlight selection and show message in sun
let lastSelected = null;
function selectDiya(el){
  if(lastSelected) lastSelected.classList.remove('selected');
  el.classList.add('selected');
  lastSelected = el;
}

// ripple effect
function triggerRipple(diya){
  const r = diya.querySelector('.ripple');
  if(!r) return;
  r.style.transition = 'none';
  r.style.transform = 'scale(0.3)';
  r.style.opacity = '0.6';
  requestAnimationFrame(()=> {
    r.style.transition = 'transform .6s ease, opacity .6s ease';
    r.style.transform = 'scale(1.06)';
    r.style.opacity = '0';
  });
}

// show message and scroll on small screens
function showInSun(text, sourceDiya){
  sunText.textContent = text;
  sunMsg.classList.add('show');
  if(sourceDiya) selectDiya(sourceDiya);

  if(window.innerWidth < 720){
    const rect = document.querySelector('.sun-core').getBoundingClientRect();
    const offset = Math.max(0, rect.top + window.scrollY - 80);
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

// attach interactions
diyas.forEach((d, idx)=>{
  d.addEventListener('click', ()=> { triggerRipple(d); showInSun(d.dataset.msg, d); });
  d.addEventListener('touchstart', (e)=> { e.stopPropagation(); triggerRipple(d); showInSun(d.dataset.msg, d); }, {passive:true});
  d.addEventListener('keydown', (ev)=> { if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); triggerRipple(d); showInSun(d.dataset.msg, d); }});
  d.setAttribute('aria-label', `Diya ${idx+1} — press to show blessing in sun`);
});

// close message
sunClose.addEventListener('click', (e)=>{ e.stopPropagation(); sunMsg.classList.remove('show'); });

// ESC hides message
window.addEventListener('keydown', (e)=> { if(e.key === 'Escape') sunMsg.classList.remove('show'); });

// reflect audio state changes
ambience.addEventListener('play', ()=> updateIconState(true));
ambience.addEventListener('pause', ()=> updateIconState(false));
updateIconState(false);

// make first diya keyboard focusable
const firstDiya = document.querySelector('.diya');
if(firstDiya) firstDiya.setAttribute('tabindex','0');

// handle orientation change to keep sun visible
window.addEventListener('orientationchange', () => {
  setTimeout(()=> {
    if(sunMsg.classList.contains('show')){
      const rect = document.querySelector('.sun-core').getBoundingClientRect();
      if(window.innerWidth < 720){
        const offset = Math.max(0, rect.top + window.scrollY - 80);
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  }, 350);
});
