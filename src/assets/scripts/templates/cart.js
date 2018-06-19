import '../sections/cart';

import $ from 'jquery';
import sections from '@shopify/theme-sections';

$(document).ready(() => {
  sections.load('cart');
});
