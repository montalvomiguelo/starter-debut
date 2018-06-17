/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
 * @namespace product
 */

import $ from 'jquery';
import Variants from '@shopify/theme-variants';
import {formatMoney} from '@shopify/theme-currency';
import sections from '@shopify/theme-sections';
import enquire from 'enquire.js';
import 'slick-carousel';

const selectors = {
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  originalSelectorId: '[data-product-select]',
  priceWrapper: '[data-price]',
  productImageWrapper: '[data-product-image-wrapper]',
  productFeaturedImage: '[data-product-featured-image]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  productThumbs: '[data-product-single-thumbnail]',
  productThumbsWrapper: '[data-product-thumbnails-wrapper]',
  singleOptionSelector: '[data-single-option-selector]',
  regularPrice: '[data-regular-price]',
  salePrice: '[data-sale-price]',
};

const cssClasses = {
  activeThumbnail: 'active-thumb',
  hide: 'hide',
  productOnSale: 'price--on-sale',
  productUnavailable: 'price--unavailable',
};

/**
 * Product section constructor. Runs on page load as well as Theme Editor
 * `section:load` events.
 * @param {string} container - selector for the section container DOM element
 */

sections.register('product', {
  onLoad() {
    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$(selectors.productJson, this.$container).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(
      $(selectors.productJson, this.$container).html(),
    );

    this.settings = {
      mediaQueryMediumUp: 'screen and (min-width: 750px)',
      mediaQuerySmall: 'screen and (max-width: 749px)',
      bpSmall: false,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      namespace: `.slideshow-${this.id}`,
      sliderActive: false,
      zoomEnabled: $(selectors.productImageWrapper, this.$container).hasClass('js-zoom-enabled'),
    };

    this.initBreakpoints();
    this.initVariants();
    this.initImageSwitch();
    this.setActiveThumbnail();
  },

  initBreakpoints() {
    const self = this;

    enquire.register(this.settings.mediaQuerySmall, {
      match() {
        if ($(selectors.productThumbs).length > 3) {
          self.initThumbnailSlider();
        }
        self.settings.bpSmall = true;
      },

      unmatch() {
        if (self.settings.sliderActive) {
          self.destroyThumbnailSlider();
        }
        self.settings.bpSmall = false;
      },
    });
  },

  initThumbnailSlider() {
    const options = {
      slidesToShow: 4,
      slidesToScroll: 3,
      infinite: false,
      prevArrow: `.thumbnails-slider__prev--${this.id}`,
      nextArrow: `.thumbnails-slider__next--${this.id}`,
      responsive: [
        {
          breakpoint: 321,
          settings: {
            slidesToShow: 3,
          },
        },
      ],
    };

    $(selectors.productThumbsWrapper).slick(options);

    this.settings.sliderActive = true;
  },

  destroyThumbnailSlider() {
    $(selectors.productThumbsWrapper).slick('unslick');

    this.settings.sliderActive = false;
  },

  initVariants() {
    const options = {
      $container: this.$container,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject,
    };

    this.settings = {};
    this.variants = new Variants(options);

    this.$container.on(
      `variantChange${this.namespace}`,
      this.updateAddToCartState.bind(this),
    );
    this.$container.on(
      `variantPriceChange${this.namespace}`,
      this.updateProductPrices.bind(this),
    );
    this.$container.on(
      `variantImageChange${this.namespace}`,
      this.updateImages.bind(this),
    );
  },

  initImageSwitch() {
    if (!$(selectors.productThumbs).length) {
      return;
    }

    $(selectors.productThumbs).on('click', (evt) => {
      evt.preventDefault();
      const $el = $(evt.currentTarget);

      const imageId = $el.data('thumbnail-id');

      this.switchImage(imageId);
      this.setActiveThumbnail(imageId);
    });
  },

  setActiveThumbnail(imageId) {
    let id = imageId;

    // If there is no element passed, find it by the current product image
    if (typeof id === 'undefined') {
      id = $(
        `${selectors.productImageWrapper}:not(".${cssClasses.hide}")`,
      ).data('image-id');
    }

    const $thumbnail = $(
      `${selectors.productThumbs}[data-thumbnail-id="${id}"]`,
    );

    $(selectors.productThumbs)
      .removeClass(cssClasses.activeThumbnail)
      .removeAttr('aria-current');

    $thumbnail.addClass(cssClasses.activeThumbnail);
    $thumbnail.attr('aria-current', true);
  },

  switchImage(imageId) {
    const $newImage = $(
      `${selectors.productImageWrapper}[data-image-id='${imageId}']`,
      this.$container,
    );
    const $otherImages = $(
      `${selectors.productImageWrapper}:not([data-image-id='${imageId}'])`,
      this.$container,
    );
    $newImage.removeClass(cssClasses.hide);
    $otherImages.addClass(cssClasses.hide);
  },

  /**
   * Updates the DOM state of the add to cart button
   *
   * @param {boolean} enabled - Decides whether cart is enabled or disabled
   * @param {string} text - Updates the text notification content of the cart
   */
  updateAddToCartState(evt) {
    const variant = evt.variant;

    if (variant) {
      if (variant.available) {
        $(selectors.addToCart, this.$container).prop('disabled', false);
        $(selectors.addToCartText, this.$container).html(theme.strings.addToCart);
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(theme.strings.soldOut);
      }
    } else {
      $(selectors.addToCart, this.$container).prop('disabled', true);
      $(selectors.addToCartText, this.$container).html(theme.strings.unavailable);
    }
  },

  updateImages(evt) {
    const variant = evt.variant;
    const imageId = variant.featured_image.id;

    this.switchImage(imageId);
    this.setActiveThumbnail(imageId);
  },

  /**
   * Updates the DOM with specified prices
   *
   * @param {string} productPrice - The current price of the product
   * @param {string} comparePrice - The original price of the product
   */
  updateProductPrices(evt) {
    const variant = evt.variant;

    const $priceContainer = $(selectors.priceWrapper, this.$container);
    const $regularPrice = $(selectors.regularPrice, $priceContainer);
    const $salePrice = $(selectors.salePrice, $priceContainer);

    // Reset product price state
    $priceContainer
      .removeClass(cssClasses.productUnavailable)
      .removeClass(cssClasses.productOnSale)
      .removeAttr('aria-hiden');

   // Unavailable
    if (!variant) {
      $priceContainer
        .addClass(cssClasses.productUnavailable)
        .attr('aria-hidden', true);
      return;
    }

    // On sale
    if (variant.compare_at_price > variant.price) {
      $regularPrice.html(
        formatMoney(
          variant.compare_at_price,
          theme.moneyFormat,
        ),
      );
      $salePrice.html(
        formatMoney(variant.price, theme.moneyFormat),
      );
      $priceContainer.addClass(cssClasses.productOnSale);
    } else {
      // Regular price
      $regularPrice.html(
        formatMoney(variant.price, theme.moneyFormat),
      );
    }
  },

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    this.$container.off(this.namespace);
  },
});
