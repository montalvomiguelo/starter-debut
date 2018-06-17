import sections from '@shopify/theme-sections';
import Header from '../modules/header';
import Search from '../modules/search';
import MobileNav from '../modules/mobile-nav';

sections.register('header', {
  onLoad() {
    Header.init();
    MobileNav.init();
    Search.init();
  },
});
