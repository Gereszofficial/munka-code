
/**
 * Premium dark transition helper
 * Usage:
 *   await window.playTransition(() => { /* mutate DOM or navigate *\/ });
 */
(function(){
  const overlayId = 'page-transition-overlay';
  let overlay = document.getElementById(overlayId);
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'transition-overlay';
    document.body.appendChild(overlay);
  }

  const waitForAnimation = (el) => new Promise((resolve) => {
    const done = () => { el.removeEventListener('animationend', done); resolve(); };
    // Fallback in case animationend is missed
    const to = setTimeout(done, 900);
    el.addEventListener('animationend', () => { clearTimeout(to); done(); }, { once:true });
  });

  async function runTransition(mutator){
    // wipe out
    overlay.classList.remove('is-return');
    overlay.classList.add('is-active');
    await waitForAnimation(overlay);

    // change DOM
    if(typeof mutator === 'function'){ await mutator(); }

    // wipe in (reveal)
    overlay.classList.remove('is-active');
    overlay.classList.add('is-return');
    await waitForAnimation(overlay);

    overlay.classList.remove('is-return');
  }

  window.playTransition = runTransition;
})();
