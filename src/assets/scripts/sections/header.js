import sections from '@shopify/theme-sections';
import Search from '../modules/search';
import MobileNav from '../modules/mobile-nav';

sections.register('header', {
  onLoad() {
    Search.init();
    MobileNav.init();
  }
});
