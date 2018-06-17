import $ from 'jquery';
import enquire from 'enquire.js';
import {trapFocus, removeTrapFocus} from '@shopify/theme-a11y';
import 'prepare-transition/preparetransition';

const MobileNav = (function() {

  const classes = {
    mobileNavOpenIcon: 'mobile-nav--open',
    mobileNavCloseIcon: 'mobile-nav--close',
    navLinkWrapper: 'mobile-nav__item',
    navLink: 'mobile-nav__link',
    subNavLink: 'mobile-nav__sublist-link',
    return: 'mobile-nav__return-btn',
    subNavActive: 'is-active',
    subNavClosing: 'is-closing',
    navOpen: 'js-menu--is-open',
    subNavShowing: 'sub-nav--is-open',
    thirdNavShowing: 'third-nav--is-open',
    subNavToggleBtn: 'js-toggle-submenu',
  };
  let cache = {};
  let isTransitioning;
  let $activeSubNav;
  let $activeTrigger;
  let menuLevel = 1;
  // Breakpoints from src/stylesheets/global/variables.scss.liquid
  const mediaQuerySmall = 'screen and (max-width: 749px)';

  function init() {
    cacheSelectors();

    cache.$mobileNavToggle.on('click', toggleMobileNav);
    cache.$subNavToggleBtn.on('click.subNav', toggleSubNav);

    // Close mobile nav when unmatching mobile breakpoint
    enquire.register(mediaQuerySmall, {
      unmatch() {
        closeMobileNav();
      },
    });
  }

  function toggleMobileNav() {
    if (cache.$mobileNavToggle.hasClass(classes.mobileNavCloseIcon)) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function cacheSelectors() {
    cache = {
      $pageContainer: $('#PageContainer'),
      $siteHeader: $('.site-header'),
      $mobileNavToggle: $('.js-mobile-nav-toggle'),
      $mobileNavContainer: $('.mobile-nav-wrapper'),
      $mobileNav: $('#MobileNav'),
      $sectionHeader: $('#shopify-section-header'),
      $subNavToggleBtn: $(`.${classes.subNavToggleBtn}`),
    };
  }

  function openMobileNav() {
    const translateHeaderHeight = cache.$siteHeader.outerHeight();

    cache.$mobileNavContainer.prepareTransition().addClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: `translateY(${translateHeaderHeight}px)`,
    });

    cache.$pageContainer.css({
      transform: `translate3d(0, ${cache.$mobileNavContainer[0].scrollHeight}px, 0)`,
    });

    $(document).off('focusin');

    trapFocus({
      $container: cache.$sectionHeader,
      $elementToFocus: cache.$mobileNavToggle,
      namespace: 'navFocus',
    });

    cache.$mobileNavToggle
      .addClass(classes.mobileNavCloseIcon)
      .removeClass(classes.mobileNavOpenIcon)
      .attr('aria-expanded', true);

    // close on escape
    $(window).on('keyup.mobileNav', (evt) => {
      if (evt.which === 27) {
        closeMobileNav();
      }
    });
  }

  function closeMobileNav() {
    cache.$mobileNavContainer.prepareTransition().removeClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: 'translateY(-100%)',
    });

    cache.$pageContainer.removeAttr('style');

    trapFocus({
      $container: $('html'),
      $elementToFocus: $('body'),
    });

    cache.$mobileNavContainer.one(
      'TransitionEnd.navToggle webkitTransitionEnd.navToggle transitionend.navToggle oTransitionEnd.navToggle',
      () => {
        removeTrapFocus({
          $container: cache.$mobileNav,
          namespace: 'navFocus',
        });
      },
    );

    cache.$mobileNavToggle
      .addClass(classes.mobileNavOpenIcon)
      .removeClass(classes.mobileNavCloseIcon)
      .attr('aria-expanded', false)
      .focus();

    $(window).off('keyup.mobileNav');

    window.scrollTo(0, 0);
  }

  function toggleSubNav(evt) {
    if (isTransitioning) {
      return;
    }

    const $toggleBtn = $(evt.currentTarget);
    const isReturn = $toggleBtn.hasClass(classes.return);
    isTransitioning = true;

    if (isReturn) {
      // Close all subnavs by removing active class on buttons
      $(`.${classes.subNavToggleBtn}[data-level="${menuLevel - 1}"]`)
        .removeClass(classes.subNavActive);

      if ($activeTrigger && $activeTrigger.length) {
        $activeTrigger.removeClass(classes.subNavActive);
      }
    } else {
      $toggleBtn.addClass(classes.subNavActive);
    }

    $activeTrigger = $toggleBtn;

    goToSubnav($toggleBtn.data('target'));
  }

  function goToSubnav(target) {
    const $targetMenu = target
      ? $(`.mobile-nav__dropdown[data-parent="${target}"]`)
      : cache.$mobileNav;

    menuLevel = $targetMenu.data('level') ? $targetMenu.data('level') : 1;

    if ($activeSubNav && $activeSubNav.length) {
      $activeSubNav.prepareTransition().addClass(classes.subNavClosing);
    }

    $activeSubNav = $targetMenu;

    const translateMenuHeight = $targetMenu.outerHeight();

    const openNavClass = menuLevel > 2 ? classes.thirdNavShowing : classes.subNavShowing;

    cache.$mobileNavContainer
      .css('height', translateMenuHeight)
      .removeClass(classes.thirdNavShowing)
      .addClass(openNavClass);

    if (!target) {
      // Show top level nav
      cache.$mobileNavContainer
        .removeClass(classes.thirdNavShowing)
        .removeClass(classes.subNavShowing);
    }

    /* if going back to first subnav, focus is on whole header */
    const $container = menuLevel === 1 ? cache.$sectionHeader : $targetMenu;

    const $menuTitle = $targetMenu.find(`[data-menu-title="${menuLevel}"]`);
    const $elementToFocus = $menuTitle ? $menuTitle : $targetMenu;

    // Focusing an item in the subnav early forces element into view and breaks the animation.
    cache.$mobileNavContainer.one(
      'TransitionEnd.subnavToggle webkitTransitionEnd.subnavToggle transitionend.subnavToggle oTransitionEnd.subnavToggle',
      () => {
        trapFocus({
          $container,
          $elementToFocus,
          namespace: 'subNavFocus',
        });

        cache.$mobileNavContainer.off('.subnavToggle');
        isTransitioning = false;
      },
    );

    // Match height of subnav
    cache.$pageContainer.css({
      transform: `translateY(${translateMenuHeight}px)`,
    });

    $activeSubNav.removeClass(classes.subNavClosing);
  }

  return {
    init,
    closeMobileNav,
  };

})();

export default MobileNav;
