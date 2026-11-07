document.querySelectorAll('.accordion-button').forEach(button => {
  button.addEventListener('click', () => {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    const isOpen = button.classList.toggle('active');

    button.setAttribute('aria-expanded', String(isOpen));
    content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '0';
    if (icon) icon.textContent = isOpen ? '-' : '+';
  });
});
