import $ from 'jquery';
import Drawer from '../global/drawer';
import MobileNav from '../modules/mobile-nav';

const Search = (function() {

  const selectors = {
    search: '.search',
    searchSubmit: '.search__submit',
    searchInput: '.search__input',

    siteHeader: '.site-header',
    siteHeaderSearchToggle: '.site-header__search-toggle',
    siteHeaderSearch: '.site-header__search',

    searchDrawer: '.search-bar',
    searchDrawerInput: '.search-bar__input',

    searchHeader: '.search-header',
    searchHeaderInput: '.search-header__input',
    searchHeaderSubmit: '.search-header__submit',

    searchResultSubmit: '#SearchResultSubmit',
    searchResultInput: '#SearchInput',
    searchResultMessage: '[data-search-error-message]',

    mobileNavWrapper: '.mobile-nav-wrapper',
  };

  const classes = {
    focus: 'search--focus',
    hidden: 'hide',
    mobileNavIsOpen: 'js-menu--is-open',
  };

  function init() {
    if (!$(selectors.siteHeader).length) {
      return;
    }

    initDrawer();

    const searchQuery = getParameterByName('q');

    if (searchQuery !== null) {
      validateSearchResultForm();
    }

    $(selectors.searchResultSubmit).on('click', validateSearchResultForm);

    $(selectors.searchHeaderInput)
      .add(selectors.searchHeaderSubmit)
      .on('focus blur', () => {
        $(selectors.searchHeader).toggleClass(classes.focus);
      });

    $(selectors.siteHeaderSearchToggle).on('click', () => {
      const searchHeight = $(selectors.siteHeader).outerHeight();
      const searchOffset = $(selectors.siteHeader).offset().top - searchHeight;

      $(selectors.searchDrawer).css({
        height: `${searchHeight}px`,
        top: `${searchOffset}px`,
      });
    });
  }

  function initDrawer() {
    // Add required classes to HTML
    $('#PageContainer').addClass('drawer-page-content');
    $('.js-drawer-open-top')
      .attr('aria-controls', 'SearchDrawer')
      .attr('aria-expanded', 'false')
      .attr('aria-haspopup', 'dialog');

    theme.SearchDrawer = new Drawer('SearchDrawer', 'top', {
      onDrawerOpen: searchDrawerFocus,
      onDrawerClose: searchDrawerFocusClose,
    });
  }

  function searchDrawerFocus() {
    searchFocus($(selectors.searchDrawerInput));

    if ($(selectors.mobileNavWrapper).hasClass(classes.mobileNavIsOpen)) {
      MobileNav.closeMobileNav();
    }
  }

  function searchFocus($el) {
    $el.focus();
    // set selection range hack for iOS
    $el[0].setSelectionRange(0, $el[0].value.length);
  }

  function searchDrawerFocusClose() {
    $(selectors.siteHeaderSearchToggle).focus();
  }

  function getParameterByName(name, url) {
    let uri = url;
    if (!uri) { uri = window.location.href; }
    const query = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${query}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(uri);
    if (!results) { return null; }
    if (!results[2]) { return ''; }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function validateSearchResultForm(evt) {
    const isInputValueEmpty = ($(selectors.searchResultInput).val().trim().length === 0);

    if (!isInputValueEmpty) {
      hideErrorMessage();
      return;
    }

    if (typeof evt !== 'undefined') {
      evt.preventDefault();
    }

    searchFocus($(selectors.searchResultInput));
    showErrorMessage();
  }

  function hideErrorMessage() {
    $(selectors.searchResultMessage).addClass(classes.hidden);
    $(selectors.searchResultInput)
      .removeAttr('aria-describedby')
      .removeAttr('aria-invalid');
  }

  function showErrorMessage() {
    $(selectors.searchResultMessage).removeClass(classes.hidden);
    $(selectors.searchResultInput)
      .attr('aria-describedby', 'error-search-form')
      .attr('aria-invalid', true);
  }

  return {
    init,
  };

})();

export default Search;
