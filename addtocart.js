document.addEventListener('DOMContentLoaded', function () {
  function getCartItems() {
    try {
      const raw = localStorage.getItem('cartItems');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
    updateCartBadge(items);
  }

  function getCartQuantity(items) {
    return items.reduce(function (sum, item) { return sum + (item.quantity || 0); }, 0);
  }

  // Sidebar and overlay
  var overlay = document.createElement('div');
  overlay.className = 'cart-overlay';

  var sidebar = document.createElement('aside');
  sidebar.className = 'cart-sidebar';
  sidebar.innerHTML = '' +
    '<div class="cart-header">' +
      '<h3>Your Cart</h3>' +
      '<button type="button" class="cart-close" aria-label="Close">×</button>' +
    '</div>' +
    '<div class="cart-items" id="cart-items"></div>' +
    '<div class="cart-footer">' +
      '<div class="cart-subtotal"><span>Subtotal</span><span id="cart-subtotal">RM0.00</span></div>' +
      '<div class="cart-actions">' +
        '<button type="button" class="cart-clear">Clear Cart</button>' +
        '<a class="cart-checkout" href="checkoutform.html">Checkout</a>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  document.body.appendChild(sidebar);

  function openCart() {
    overlay.classList.add('open');
    sidebar.classList.add('open');
    renderCart();
  }

  function closeCart() {
    overlay.classList.remove('open');
    sidebar.classList.remove('open');
  }

  overlay.addEventListener('click', closeCart);
  sidebar.querySelector('.cart-close').addEventListener('click', closeCart);

  // Checkout: show success message, clear cart, close
  var checkoutBtn = sidebar.querySelector('.cart-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var items = getCartItems();
      if (!items.length) {
        alert('Your cart is empty.');
        return;
      }
      alert('Checkout successful!');
      saveCartItems([]);
      renderCart();
      closeCart();
    });
  }

  // Toggle from any link pointing to cart.html (existing bag icon)
  Array.prototype.slice.call(document.querySelectorAll('a[href="cart.html"]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openCart();
    });
  });

  // Create/Update cart badge next to the bag icon if present
  function ensureCartBadgeAnchor() {
    var bagAnchor = document.querySelector('a[href="cart.html"]');
    if (!bagAnchor) return null;
    if (!bagAnchor.parentElement) return bagAnchor;
    var badge = bagAnchor.parentElement.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      bagAnchor.parentElement.style.position = 'relative';
      bagAnchor.parentElement.appendChild(badge);
    }
    return badge;
  }

  function updateCartBadge(items) {
    var badge = ensureCartBadgeAnchor();
    if (!badge) return;
    var qty = getCartQuantity(items || getCartItems());
    badge.textContent = qty > 99 ? '99+' : String(qty);
    badge.style.display = qty > 0 ? 'inline-block' : 'none';
  }

  // Parse price text like "RM50.00" → 50.00
  function parsePriceToNumber(text) {
    if (!text) return 0;
    var n = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function formatCurrency(n) {
    return 'RM' + (n || 0).toFixed(2);
  }

  function renderCart() {
    var items = getCartItems();
    var list = sidebar.querySelector('#cart-items');
    list.innerHTML = '';

    if (!items.length) {
      list.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    } else {
      items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'cart-item';
        row.setAttribute('data-id', item.id);
        row.innerHTML = '' +
          '<img class="cart-item-image" src="' + (item.image || '') + '" alt="' + (item.name || '') + '">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">' + (item.name || '') + '</div>' +
            (item.size ? ('<div class="cart-item-size">Size: ' + item.size + '</div>') : '') +
          '</div>' +
          '<div class="cart-item-qty"><input type="number" min="1" value="' + (item.quantity || 1) + '"></div>' +
          '<div class="cart-item-price">' + formatCurrency((item.price || 0) * (item.quantity || 1)) + '</div>' +
          '<button type="button" class="cart-item-remove" aria-label="Remove">×</button>';
        list.appendChild(row);
      });
    }

    var subtotal = items.reduce(function (sum, item) {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
    sidebar.querySelector('#cart-subtotal').textContent = formatCurrency(subtotal);

    updateCartBadge(items);

    // Bind per-item events
    Array.prototype.slice.call(sidebar.querySelectorAll('.cart-item-qty input')).forEach(function (input) {
      input.addEventListener('change', function (e) {
        var value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) value = 1;
        e.target.value = value;
        var row = e.target.closest('.cart-item');
        var id = row.getAttribute('data-id');
        var items = getCartItems();
        var idx = items.findIndex(function (it) { return it.id === id; });
        if (idx > -1) {
          items[idx].quantity = value;
          saveCartItems(items);
          renderCart();
        }
      });
    });

    Array.prototype.slice.call(sidebar.querySelectorAll('.cart-item-remove')).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var row = e.target.closest('.cart-item');
        var id = row.getAttribute('data-id');
        var items = getCartItems().filter(function (it) { return it.id !== id; });
        saveCartItems(items);
        renderCart();
      });
    });

    // Clear cart
    var clearBtn = sidebar.querySelector('.cart-clear');
    clearBtn.onclick = function () {
      saveCartItems([]);
      renderCart();
    };
  }

  // Add-to-cart on product detail pages
  var addBtn = document.querySelector('.single-pro-details .normal');
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      var nameEl = document.querySelector('.single-pro-details h4');
      var priceEl = document.querySelector('.single-pro-details h2');
      var sizeEl = document.querySelector('.single-pro-details select');
      var qtyEl = document.querySelector('.single-pro-details input[type="number"]');
      var imgEl = document.querySelector('#MainImg') || document.querySelector('.single-pro-image img');

      var name = nameEl ? nameEl.textContent.trim() : '';
      var price = parsePriceToNumber(priceEl ? priceEl.textContent : '');
      var sizeVal = sizeEl ? String(sizeEl.value || '').trim() : '';
      if (sizeVal && /select size/i.test(sizeVal)) sizeVal = '';
      var quantity = Math.max(1, parseInt(qtyEl && qtyEl.value ? qtyEl.value : '1', 10) || 1);
      var image = imgEl ? imgEl.src : '';

      var id = name + '|' + (sizeVal || '');

      var items = getCartItems();
      var idx = items.findIndex(function (it) { return it.id === id; });
      if (idx > -1) {
        items[idx].quantity += quantity;
      } else {
        items.push({ id: id, name: name, price: price, size: sizeVal, quantity: quantity, image: image });
      }
      saveCartItems(items);
      renderCart();
      openCart();
    });
  }

  // Initial render/badge
  updateCartBadge(getCartItems());
});


