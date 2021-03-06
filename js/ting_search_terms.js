(function ($) {
  'use strict';

  /**
   * Get last search term from the input value.
   */
  function getLastTerm(value) {
    var result = '';
    if (value !== '') {
      result =  value.split(/\s/).pop();
    }

    return result;
  }

  Drupal.behaviors.selectSearchTerms = {
    attach: function(context, settings) {
      if (context === document) {
        // Extended search button location.
        $('.search .collapsible .fieldset-legend > a').insertBefore('.search .form-submit');

        var $searchField = $('input[name=search_block_form]');

        // Append logical operation to the search field input.
        $('.search-term-op', context).on('click', function (event) {
          if (getLastTerm($searchField.val())) {
            $searchField.val($searchField.val() + ' ' + $(this).text() + ' ');
          }
          $searchField.focus();
        });

        $('#search-terms, #kommandosgning').on('click', function(e) {
          $searchField.focus();
        });

        // Move focus on textfield on fieldset link click.
        $('#ting-search-terms-fieldset').on('mouseup', '.fieldset-title', function (event) {
          if (!$searchField.hasClass('collapsed')) {
            $searchField.focus();
          }
        });

        // Provide autocomplete methods.
        $.widget('ting.searchTerms', $.ui.autocomplete, {
          // Render each item list and append it to autocomplete list.
          _renderItem: function (ul, item) {
            return $("<li class='search-term' />")
              .append('<p class="search-key">' + item.value + '</p><p class="search-description">' + item.description + '</p>')
              .appendTo(ul);
          }
        });

        // Get all terms.
        var searchTerms = Drupal.settings.searchTerms;

        // Initiate terms autocomplete.
        $searchField.searchTerms({
          minLength: 0,
          appendTo: '#ting-search-terms-container',
          // Filter source only by the terms inserted after logical operations.
          source: function (request, response) {
            response($.ui.autocomplete.filter(searchTerms, getLastTerm(request.term)));
          },
          // Remove last inserted term and append the autocomplete value to the textfield.
          select: function (event, ui) {
            var $inputValue = $(this).val();
            var lastIndex = $inputValue.lastIndexOf(getLastTerm($inputValue));
            $inputValue = $inputValue.substring(0, lastIndex);

            $(this).val($inputValue + ui.item.value + '=""');
            $(this).focus();

            // Put caret inside of the quotes.
            var inputLength = $(this).val().length;
            $(this)[0].setSelectionRange(inputLength, inputLength - 1);

            return false;
          },

          // Update searched term on focus.
          focus: function (event, ui) {
            // Exclude contrib styles on item focus.
            $('#ting-search-terms-container').find('.ui-widget-content').removeClass('ui-widget-content');
            $('#ting-search-terms-container').find('.ui-state-focus').removeClass('ui-state-focus');
            // Prevent focus on mouse hover.
            if (event.keyCode === undefined) {
              return false;
            }

            // Replace search term with the focused one.
            var $inputValue = $(this).val();
            var lastIndex = $inputValue.lastIndexOf(getLastTerm($inputValue));
            $inputValue = $inputValue.substring(0, lastIndex);
            $(this).val($inputValue + ui.item.value);

            return false;
          },
          // Keep autocomplete open all the time.
          close: function (event, ui) {
            $(this).searchTerms("search", "");
          }
        })
        // Display all items on fieldset expand.
        .focus(function () {
          $(this).searchTerms("search", "");
        })
        // Prevent navigation to other item on TAB press.
        .bind('keydown', function (event) {
          if (event.keyCode === $.ui.keyCode.TAB) {
            event.preventDefault();
          }
        });
      }
    }
  };

  // Extend toggleFiledset function in order to collapse other fieldsets.
  Drupal.toggleFieldset = (function(toggleFieldset){
    return function() {
      // Call original function from collapse.js
      toggleFieldset.apply(this, arguments);
      // Add collapsed class to other fieldsets.
      $('fieldset#ting-search-terms-fieldset').not(arguments[0]).addClass('collapsed');
    };
  })(Drupal.toggleFieldset);
})(jQuery1102);
