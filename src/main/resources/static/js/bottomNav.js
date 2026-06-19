/**
 * ORSAI — Bottom Navigation
 * Inyecta el menú inferior en todas las páginas
 */
(function () {
  const NAV_ITEMS = [
    {
      id: 'inicio',
      label: 'Inicio',
      href: '/',
      icon: `<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`
    },
    {
      id: 'pronosticos',
      label: 'Pronósticos',
      href: '/pages/group-prediction',
      icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>`
    },
    {
      id: 'posiciones',
      label: 'Fixture',
      href: '/pages/group-standings',
      icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
    },
    {
      id: 'grupos',
      label: 'Mis Grupos',
      href: '/pages/privategroups',
      icon: `<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></svg>`
    }
  ];

  // Determinar pestaña activa según URL
  function getActiveId() {
    const path = window.location.pathname;
    if (path === '/' || path.endsWith('index.html')) return 'inicio';
    if (path.includes('group-prediction')) return 'pronosticos';
    if (path.includes('group-standings')) return 'posiciones';
    if (path.includes('ranking')) return 'ranking';
    if (path.includes('privategroup')) return 'grupos';
    return '';
  }

  function render() {
    const activeId = getActiveId();
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Menú principal');

    nav.innerHTML = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="${item.id === activeId ? 'active' : ''}" aria-label="${item.label}">
        ${item.icon}
        <span>${item.label}</span>
      </a>
    `).join('');

    document.body.appendChild(nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
