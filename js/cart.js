(() => {
  const KEY = 'swiftsupplyCartV1';
  const read = () => { try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const write = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new CustomEvent('cart-updated')); };
  const clean = (items) => items.filter(i => i && i.id && Number(i.quantity) > 0).map(i => ({...i, quantity: Math.max(1, Math.floor(Number(i.quantity)))}));
  const reserved = (id) => read().filter(i => i.id === id).reduce((n, i) => n + Math.max(0, Math.floor(Number(i.quantity) || 0)), 0);
  const available = (product) => Math.max(0, Math.floor(Number(product?.stock) || 0) - reserved(product?.id));
  function add(product, quantity = 1) {
    if (!product?.id) return { ok:false, available:0 };
    const requested = Math.max(1, Math.floor(Number(quantity) || 1));
    const existing = read().find(i => i.id === product.id);
    const alreadyInCart = existing ? Number(existing.quantity) || 0 : 0;
    const remaining = Math.max(0, Math.floor(Number(product.stock) || 0) - alreadyInCart);
    if (requested > remaining) return { ok:false, available:remaining };
    const items = read();
    if (existing) existing.quantity += requested;
    else items.push({ id: product.id, name: product.name, price: Number(product.price), bundle_label: product.bundle_label || '', image_url: product.image_url || '', quantity: requested });
    write(clean(items));
    return { ok:true, available:remaining-requested };
  }
  function update(id, quantity) { write(clean(read().map(i => i.id === id ? {...i, quantity} : i))); }
  function remove(id) { write(read().filter(i => i.id !== id)); }
  function clear() { localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('cart-updated')); }
  function count() { return read().reduce((n, i) => n + Number(i.quantity || 0), 0); }
  function bundle(item) {
    const m = String(item.bundle_label || '').match(/^\s*(\d+)\s+for\s+\$?([0-9]+(?:\.[0-9]{1,2})?)\s*$/i);
    if (!m) return null; return { qty: Number(m[1]), price: Number(m[2]) };
  }
  function lineTotal(item) { const b = bundle(item), q = Number(item.quantity); return b ? Math.floor(q / b.qty) * b.price + (q % b.qty) * Number(item.price) : q * Number(item.price); }
  function total() { return read().reduce((n, i) => n + lineTotal(i), 0); }
  function money(v) { return '$' + Number(v || 0).toFixed(2); }
  function renderBadges() {
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count(); el.hidden = count() === 0; });
    document.querySelectorAll('[data-cart-total]').forEach(el => { el.textContent = money(total()); });
  }
  window.SwiftCart = { read, add, update, remove, clear, count, total, lineTotal, money, bundle, reserved, available, renderBadges };
  document.addEventListener('DOMContentLoaded', renderBadges);
  window.addEventListener('cart-updated', renderBadges);
})();
