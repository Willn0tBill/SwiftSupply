(() => {
  const KEY = 'swiftsupplyCartV1';
  const read = () => { try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const write = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new CustomEvent('cart-updated')); };
  const clean = (items) => items.filter(i => i && i.id && Number(i.quantity) > 0).map(i => ({...i, quantity: Math.max(1, Math.floor(Number(i.quantity)))}));
  const groupKey = item => item?.stock_group || `catalog:${item?.id || ''}`;
  const reservedGroup = item => {
    const key = typeof item === 'string' ? item : groupKey(item);
    return read().filter(i => groupKey(i) === key).reduce((n, i) => n + Math.max(0, Math.floor(Number(i.quantity) || 0)), 0);
  };
  const reserved = keyOrId => read().filter(i => i.id === keyOrId || groupKey(i) === keyOrId).reduce((n, i) => n + Math.max(0, Math.floor(Number(i.quantity) || 0)), 0);
  const available = product => Math.max(0, Math.floor(Number(product?.stock) || 0) - reservedGroup(product));

  function add(product, quantity = 1) {
    if (!product?.id) return { ok:false, available:0 };
    const requested = Math.max(1, Math.floor(Number(quantity) || 1));
    const items = read();
    const existing = items.find(i => i.id === product.id);
    const remaining = Math.max(0, Math.floor(Number(product.stock) || 0) - items.filter(i => groupKey(i) === groupKey(product)).reduce((n,i)=>n+Number(i.quantity||0),0));
    if (requested > remaining) return { ok:false, available:remaining };
    if (existing) {
      existing.quantity += requested;
      existing.stock = Number(product.stock) || existing.stock || 0;
      existing.stock_group = product.stock_group || existing.stock_group;
      existing.shared_stock = !!product.shared_stock;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        brand: product.brand || '',
        flavor: product.flavor || '',
        price: Number(product.price),
        bundle_label: product.bundle_label || '',
        image_url: product.image_url || '',
        stock: Number(product.stock) || 0,
        stock_group: product.stock_group || `catalog:${product.id}`,
        shared_stock: !!product.shared_stock,
        quantity: requested
      });
    }
    write(clean(items));
    return { ok:true, available:remaining-requested };
  }

  function update(id, quantity) {
    const items = read();
    const item = items.find(i => i.id === id);
    if (!item) return;
    const desired = Math.max(1, Math.floor(Number(quantity) || 1));
    const otherGroupQty = items.filter(i => i.id !== id && groupKey(i) === groupKey(item)).reduce((n,i)=>n+Number(i.quantity||0),0);
    const maxForItem = Math.max(0, Math.floor(Number(item.stock) || 0) - otherGroupQty);
    item.quantity = Math.max(1, Math.min(desired, Math.max(1,maxForItem)));
    write(clean(items));
  }
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
  window.SwiftCart = { read, add, update, remove, clear, count, total, lineTotal, money, bundle, reserved, reservedGroup, available, groupKey, renderBadges };
  document.addEventListener('DOMContentLoaded', renderBadges);
  window.addEventListener('cart-updated', renderBadges);
})();
