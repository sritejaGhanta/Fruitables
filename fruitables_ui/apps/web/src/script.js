(function () {
  'use strict';

  // Spinner
  function spinner() {
    setTimeout(function () {
      const spinnerElement = document.getElementById('spinner');
      if (spinnerElement) {
        spinnerElement.classList.remove('show');
      }
    }, 1);
  }
  spinner();

  // Fixed Navbar
  window.addEventListener('scroll', function () {
    const fixedTop = document.querySelector('.fixed-top');
    const windowWidth = window.innerWidth;

    if (windowWidth < 992) {
      if (window.scrollY > 55) {
        fixedTop.classList.add('shadow');
      } else {
        fixedTop.classList.remove('shadow');
      }
    } else {
      if (window.scrollY > 55) {
        fixedTop.classList.add('shadow');
        fixedTop.style.top = '-55px';
      } else {
        fixedTop.classList.remove('shadow');
        fixedTop.style.top = '0';
      }
    }
  });

  // Back to top button
  window.addEventListener('scroll', function () {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      if (window.scrollY > 300) {
        backToTop.style.display = 'block';
      } else {
        backToTop.style.display = 'none';
      }
    }
  });

  document.addEventListener('click', function (event) {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop && event.target === backToTop) {
      document.documentElement.scrollTop = 0;
    }
  });

  // Modal Video
  let videoSrc;
  const playButtons = document.querySelectorAll('.btn-play');
  playButtons.forEach((button) => {
    button.addEventListener('click', function () {
      videoSrc = this.dataset.src;
    });
  });

  const videoModal = document.getElementById('videoModal');
  const videoElement = document.getElementById('video');

  videoModal?.addEventListener('shown.bs.modal', function () {
    videoElement.src = videoSrc + '?autoplay=1&modestbranding=1&showinfo=0';
  });

  videoModal?.addEventListener('hide.bs.modal', function () {
    videoElement.src = videoSrc;
  });

  // Product Quantity
  const quantityButtons = document.querySelectorAll('.quantity button');
  quantityButtons?.forEach((button) => {
    button.addEventListener('click', function () {
      const input = this.parentElement.parentElement.querySelector('input');
      const oldValue = parseFloat(input.value);
      let newVal;
      if (this.classList.contains('btn-plus')) {
        newVal = oldValue + 1;
      } else {
        newVal = Math.max(0, oldValue - 1);
      }
      input.value = newVal;
    });
  });
})();
