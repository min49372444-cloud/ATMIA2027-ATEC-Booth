/* Mobile Booth Image Auto Resize */

(function () {

  const img = document.getElementById('boothImage');
  const canvas = document.getElementById('boothCanvas');
  const frame = document.getElementById('boothFrame');

  if (!img || !canvas || !frame) return;

  function resizeBooth() {

    const isMobile = window.matchMedia(
      '(max-width: 640px)'
    ).matches;

    if (
      isMobile &&
      img.naturalWidth > 0 &&
      img.naturalHeight > 0
    ) {

      const ratio = img.naturalWidth / img.naturalHeight;

      const imageWidth = Math.max(
        frame.clientWidth,
        Math.round(frame.clientHeight * ratio)
      );

      canvas.style.width = imageWidth + 'px';
      canvas.style.minWidth = imageWidth + 'px';

    } else {

      canvas.style.width = '';
      canvas.style.minWidth = '';

    }

  }

  img.addEventListener('load', resizeBooth);

  window.addEventListener('resize', resizeBooth);

  if (img.complete) {
    resizeBooth();
  }

})();
