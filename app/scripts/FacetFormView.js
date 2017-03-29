/*global Backbone, _ */
/*exported FacetFormView */
'use strict';

var FacetFormView = Backbone.View.extend({
  el: $('#js-pageContent'),
  events: {
    'submit #js-facet'                        : 'setRefineQuery',
    'click .js-refine-filter-pill'            : 'removeRefineQuery',
    'change .js-facet'                        : 'setFacet',
    'click .js-filter-pill'                   : 'removeFacet',
    'click #thumbnails,#list'                 : 'toggleViewFormat',
    'change #pag-dropdown__sort'              : 'setSort',
    'change #pag-dropdown__view'              : 'setRows',
    'click .js-prev,.js-next,a[data-start]'   : 'setStart',
    'change .pag-dropdown__select--unstyled'  : 'setStart',
    'click .js-item-link'                     : 'goToItemPage',
    'click .js-a-check__link-deselect-all'    : 'deselectAll',
    'click .js-a-check__button-deselect-all'  : 'deselectAll',
    'click .js-a-check__link-select-all'      : 'selectAll',
    'click .js-a-check__button-select-all'    : 'selectAll',
    'click .js-clear-filters'                 : 'clearFilters',
    'click .js-a-check__header'               : 'toggleFacetDropdown',
    'click .js-a-check__update'               : 'updateFacets',
    'click .js-rc-page'                       : 'paginateRelatedCollections',
    'click .js-relatedCollection'             : 'goToCollectionPage'
  },

  setRefineQuery: function(e) {
    this.model.set({start: 0, rq: $.map($('input[name=rq]'), function(el) { return $(el).val(); })});
    e.preventDefault();
  },
  removeRefineQuery: function(e) {
    var txtFilter = $(e.currentTarget).data('slug');
    $('input[form="js-facet"][name="rq"][value="' + txtFilter + '"]').val('');
    this.model.set({start: 0, rq: _.without(this.model.get('rq'), txtFilter)});
  },
  setFacet: function(e) {
    var filterType = $(e.currentTarget).attr('name');
    var attributes = {start: 0};
    attributes[filterType] = $.map($('input[name=' + filterType + ']:checked'), function(el) { return $(el).val(); });
    this.model.set(attributes);
  },
  removeFacet: function(e) {
    var filter_slug = $(e.currentTarget).data('slug');
    if (typeof filter_slug !== 'string') {
      filter_slug = String(filter_slug);
    }
    $('#' + filter_slug).prop('checked', false);
    var filterType = $('#' + filter_slug).attr('name');
    var filter = $('#' + filter_slug).attr('value');
    var attributes = {start: 0};
    attributes[filterType] = _.without(this.model.get(filterType), filter);

    this.model.set(attributes);
  },
  toggleViewFormat: function(e) {
    var viewFormat = $(e.currentTarget).attr('id');
    $('#view_format').prop('value', viewFormat);
    this.model.set({view_format: viewFormat});
  },
  setSort: function(e) {
    this.model.set({start: 0, sort: $(e.currentTarget).val() });
  },
  setRows: function(e) {
    this.model.set({start: 0, rows: $(e.currentTarget).val() });
  },
  setStart: function(e) {
    var start;
    if (e.type === 'click') {
      start = $(e.currentTarget).data('start');
    } else if (e.type === 'change') {
      start = $(e.currentTarget).children('option:selected').attr('value');
    }
    $('#start').val(start);
    this.model.set({ start: start });
  },

  goToItemPage: function(e) {
    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) { return; }

    if ($(e.currentTarget).data('item_number') !== undefined) {
      this.model.set({
        itemNumber: $(e.currentTarget).data('item_number'),
        itemId: $(e.currentTarget).data('item_id')
      }, {silent: true});

      // add implicit context for campus, institution, and collection pages
      if($('#js-institution').length > 0) {
        if($('#js-institution').data('campus')) {
          this.model.set({
            campus_slug: $('#js-institution').data('campus'),
            referral: 'campus',
            referralName: $('#js-institution').data('referralname')
          }, {silent: true});
        } else {
          this.model.set({
            repository_data: $('#js-institution').data('institution'),
            referral: 'institution',
            referralName: $('#js-institution').data('referralname')
          }, {silent: true});
        }
      } else if ($('#js-collection').length > 0) {
        this.model.set({
          collection_data: $('#js-collection').data('collection'),
          referral: 'collection',
          referralName: $('#js-collection').data('referralname')
        }, {silent: true});
      }

      e.preventDefault();
      $.pjax({
        url: $(e.currentTarget).attr('href'),
        container: '#js-pageContent'
      });
    }
  },

  deselectAll: function(e) { this.selectDeselectAll(e, false); },
  selectAll: function(e) { this.selectDeselectAll(e, true); },
  selectDeselectAll: function(e, checked) {
    var filterElements = $(e.currentTarget).parents('.check').find('.js-facet');
    filterElements.prop('checked', checked);
    filterElements.trigger('change');
    e.preventDefault();
  },
  toggleSelectDeselectAll: function() {
    var facetTypes = $('.check');
    for(var i=0; i<facetTypes.length; i++) {
      var allSelected = !($($(facetTypes[i]).find('.js-facet')).is(':not(:checked)'));
      if (allSelected === true) {
        // for large screens
        $(facetTypes[i]).find('.js-a-check__link-deselect-all').toggleClass('check__link-deselect-all--not-selected check__link-deselect-all--selected');
        $(facetTypes[i]).find('.js-a-check__link-select-all').toggleClass('check__link-select-all--selected check__link-select-all--not-selected');
        $(facetTypes[i]).find('.js-a-check__button-select-all').prop('disabled', true);
        $(facetTypes[i]).find('.js-a-check__update').prop('disabled', false);
      }
      var oneSelected = $(facetTypes[i]).find('.js-facet').is(':checked');
      if (oneSelected === true) {
        $(facetTypes[i]).find('.js-a-check__button-deselect-all').prop('disabled', false);
      }
    }
  },
  toggleTooltips: function() {
    // get rid of any visible tooltips
    var visibleTooltips = $('[data-toggle="tooltip"][aria-describedby]');
    for (var i=0; i<visibleTooltips.length; i++) {
      var tooltipId = $(visibleTooltips[i]).attr('aria-describedby');
      $('#' + tooltipId).remove();
    }
    // set tooltips
    $('[data-toggle="tooltip"]').tooltip({
      placement: 'top'
    });
  },
  clearFilters: function() {
    var filterElements = $('.js-facet');
    filterElements.prop('checked', false);
    filterElements.trigger('change');
  },

  toggleFacetDropdown: function(e) {
    //close all expanded checkbox groups
    var allSelected = $('.check__popdown--selected');
    for (var i=0; i<allSelected.length; i++) {
      if ($(allSelected[i]).parent().find('input').attr('name') !== $(e.currentTarget).parent().find('input').attr('name')) {
        $(allSelected[i]).toggleClass('check__popdown check__popdown--selected');
        $(allSelected[i]).prev('.js-a-check__header').children('.js-a-check__header-arrow-icon').toggleClass('fa-angle-down fa-angle-up');
      }
    }
    //open this checkbox group
    $(e.currentTarget).next('.js-a-check__popdown').toggleClass('check__popdown check__popdown--selected');
    $(e.currentTarget).children('.js-a-check__header-arrow-icon').toggleClass('fa-angle-down fa-angle-up');
  },
  updateFacets: function(e) {
    e.preventDefault();
    this.facetSearch();
  },
  facetSearch: function() {
    $.pjax({
      url: $('#js-facet').attr('action'),
      container: '#js-pageContent',
      data: this.model.toJSON(),
      traditional: true
    });
  },

  paginateRelatedCollections: function(e) {
    if($('#js-institution').length > 0) {
      if($('#js-institution').data('campus')) {
        this.model.set({
          campus_slug: $('#js-institution').data('campus'),
          referral: 'campus',
          referralName: $('#js-institution').data('referralname')
        }, {silent: true});
      } else {
        this.model.set({
          repository_data: $('#js-institution').data('institution'),
          referral: 'institution',
          referralName: $('#js-institution').data('referralname')
        }, {silent: true});
      }
    } else if ($('#js-collection').length > 0) {
      this.model.set({
        collection_data: $('#js-collection').data('collection'),
        referral: 'collection',
        referralName: $('#js-collection').data('referralname')
      }, {silent: true});
    }

    var data_params = this.model.toJSON();
    data_params.rc_page = $(e.currentTarget).data('rc_page');
    //TODO: function(data, status, jqXHR)
    $.ajax({data: data_params, traditional: true, url: '/relatedCollections/', success: function(data) {
        $('#js-relatedCollections').html(data);
      }
    });
  },

  goToCollectionPage: function() {
    this.model.clear({silent: true});
  },

  changeWidth: function(window_width) {
    if (window_width > 900) { this.desktop = true; }
    else { this.desktop = false; }
  },

  render: function() {
    if(!_.isEmpty(this.model.changed) && !_.has(this.model.changed, 'q')) {
      if(this.desktop) {
        this.facetSearch();
      }
      else if(_.has(this.model.changed, 'type_ss') ||
      _.has(this.model.changed, 'facet_decade') ||
      _.has(this.model.changed, 'repository_data') ||
      _.has(this.model.changed, 'collection_data')) {
        var attrUndefined = false;
        _.each(this.model.changed, function(value) {
          if (value === undefined) {
            attrUndefined = true;
          }
        });
        if (attrUndefined) {
          this.facetSearch();
        }
        _.each(this.model.changed, function(value, key) {
          if (key === 'type_ss' || key === 'facet_decade' || key === 'repository_data' || key === 'collection_data') {
            $('.facet-' + key).parents('.check').find('.js-a-check__update').prop('disabled', false);
          }
        });
      } else {
        this.facetSearch();
      }
    }
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.changeWidth($(window).width());
  }
});
