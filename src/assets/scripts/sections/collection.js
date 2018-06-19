import $ from 'jquery';
import sections from '@shopify/theme-sections';

const constants = {
  SORT_BY: 'sort_by',
};

const selectors = {
  filterSelection: '#SortTags',
  sortSelection: '#SortBy',
  defaultSort: '#DefaultSortBy',
};

sections.register('collection', {
  onLoad() {
    this.$filterSelect = $(selectors.filterSelection, this.$container);
    this.$sortSelect = $(selectors.sortSelection, this.$container);
    this.$selects = $(selectors.filterSelection, this.$container).add(
      $(selectors.sortSelection, this.$container),
    );

    this.defaultSort = this._getDefaultSortValue();
    this._resizeSelect(this.$selects);
    this.$selects.removeClass('hidden');

    this.$filterSelect.on('change', this._onFilterChange.bind(this));
    this.$sortSelect.on('change', this._onSortChange.bind(this));
  },

  _onSortChange(evt) {
    const sort = this._sortValue();
    if (sort.length) {
      window.location.search = sort;
    } else {
      // clean up our url if the sort value is blank for default
      window.location.href = window.location.href.replace(
        window.location.search,
        '',
      );
    }
    this._resizeSelect($(evt.target));
  },

  _onFilterChange(evt) {
    const filter = this._getFilterValue();

    // remove the 'page' parameter to go to the first page of results
    let search = document.location.search.replace(/\?(page=\w+)?&?/, '');

    // only add the search parameters to the url if they exist
    search = search === '' ? '' : `?${search}`;

    document.location.href = filter + search;
    this._resizeSelect($(evt.target));
  },

  _getFilterValue() {
    return this.$filterSelect.val();
  },

  _getSortValue() {
    return this.$sortSelect.val() || this.defaultSort;
  },

  _getDefaultSortValue() {
    return $(selectors.defaultSort, this.$container).val();
  },

  _sortValue() {
    const sort = this._getSortValue();
    let query = '';

    if (sort !== this.defaultSort) {
      query = `${constants.SORT_BY}=${sort}`;
    }

    return query;
  },

  _resizeSelect($selection) {
    $selection.each(function() {
      const $this = $(this);
      const arrowWidth = 10;
      // create test element
      const text = $this.find('option:selected').text();
      const $test = $('<span>').html(text);

      // add to body, get width, and get out
      $test.appendTo('body');
      const width = $test.width();
      $test.remove();

      // set select width
      $this.width(width + arrowWidth);
    });
  },

  onUnload() {
    this.$filterSelect.off('change', this._onFilterChange);
    this.$sortSelect.off('change', this._onSortChange);
  },
});
