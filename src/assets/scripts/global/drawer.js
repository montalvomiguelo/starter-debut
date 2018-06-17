import $ from 'jquery';
import 'prepare-transition/preparetransition';
import {trapFocus, removeTrapFocus} from '@shopify/theme-a11y';

class Drawer {
  constructor(id, position, options) {
    const defaults = {
      close: '.js-drawer-close',
      open: `.js-drawer-open-${position}`,
      openClass: 'js-drawer-open',
      dirOpenClass: `js-drawer-open-${position}`,
    };

    this.nodes = {
      $parent: $('html').add('body'),
      $page: $('#PageContainer'),
    };

    this.config = $.extend(defaults, options);
    this.position = position;

    this.$drawer = $(`#${id}`);

    if (!this.$drawer.length) {
      return false;
    }

    this.drawerIsOpen = false;
    this.init();
  }

  init() {
    $(this.config.open).on('click', this.open.bind(this));
    this.$drawer.on('click', this.config.close, this.close.bind(this));
  }

  open(evt) {
    // Keep track if drawer was opened from a click, or called by another function
    let externalCall = false;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the drawer opens, the click event bubbles up to nodes.$page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }

    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.$drawer.prepareTransition();

    this.nodes.$parent.addClass(`${this.config.openClass} ${this.config.dirOpenClass}`);
    this.drawerIsOpen = true;

    $(document).off('focusin');

    // Set focus on drawer
    trapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus',
    });

    // Run function when draw opens if set
    if (
      this.config.onDrawerOpen &&
      typeof this.config.onDrawerOpen === 'function'
    ) {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    this.bindEvents();

    return this;
  }

  close() {
    if (!this.drawerIsOpen) {
      // don't close a closed drawer
      return;
    }

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    // Ensure closing transition is applied to moved elements, like the nav
    this.$drawer.prepareTransition();

    this.nodes.$parent.removeClass(`${this.config.dirOpenClass} ${this.config.openClass}`);

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'false');
    }

    this.drawerIsOpen = false;

    // Remove focus on drawer
    removeTrapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus',

    });

    this.unbindEvents();

    // Run function when draw closes if set
    if (
      this.config.onDrawerClose &&
      typeof this.config.onDrawerClose === 'function'
    ) {
      this.config.onDrawerClose();
    }
  }

  bindEvents() {
    this.nodes.$parent.on(
      'keyup.drawer',
      (evt) => {
        // close on 'esc' keypress
        if (evt.keyCode === 27) {
          this.close();
          return false;
        }
        return true;
      },
    );

    // Lock scrolling on mobile
    this.nodes.$page.on('touchmove.drawer', () => false);

    this.nodes.$page.on('click.drawer', () => {
      this.close();
      return false;
    });
  }

  unbindEvents() {
    this.nodes.$page.off('.drawer');
    this.nodes.$parent.off('.drawer');
  }
}

export default Drawer;
