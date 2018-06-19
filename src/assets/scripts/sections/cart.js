import $ from 'jquery';
import sections from '@shopify/theme-sections';

const selectors = {
  edit: '.js-edit-toggle',
};

const config = {
  showClass: 'cart__update--show',
  showEditClass: 'cart__edit--active',
  cartNoCookies: 'cart--no-cookies',
};

sections.register('cart', {
  onLoad() {
    this.$edit = $(selectors.edit, this.$container);

    if (!this.cookiesEnabled()) {
      this.$container.addClass(config.cartNoCookies);
    }

    this.$edit.on('click', this._onEditClick.bind(this));
  },

  onUnload() {
    this.$edit.off('click', this._onEditClick);
  },

  _onEditClick(evt) {
    const $evtTarget = $(evt.target);
    const $updateLine = $(`.${$evtTarget.data('target')}`);

    $evtTarget.toggleClass(config.showEditClass);
    $updateLine.toggleClass(config.showClass);
  },

  cookiesEnabled() {
    let cookieEnabled = window.navigator.cookieEnabled;

    if (!cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
    }
    return cookieEnabled;
  },
});
