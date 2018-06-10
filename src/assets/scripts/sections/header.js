import sections from '@shopify/theme-sections';
import Search from '../modules/search';

sections.register('header', {
  onLoad() {
    Search.init();
  }
});
