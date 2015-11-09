//The AMD-module (require.js) of the dropdown component based on Backbone.View.

define(function(require, exports, module) {
	var Block = require('kit/collectionBlock/collectionBlock'),
		checkKey = require('kit/checkKey/checkKey');

	$(document)
		.on('click', function(e) {
			var clickedDropdownElelement;

			clickedDropdownElelement = $(e.target).not('.dropdown_datepicker__head__prevent').closest('.dropdown')[0];

			APP.$('.dropdown').each(function(index, dropdownElement) {
				if (dropdownElement != clickedDropdownElelement) {
					dropdownElement.block.close();
				}
			});
		})
		.on('keyup', function(e) {
			if(checkKey(e.keyCode, ['ESC'])) {
				APP.$('.dropdown').each(function(index, dropdownElement) {
					dropdownElement.block.close();
				});
			}
		});

	return Block.extend({
		classes: '',
		bodyClass: '',
		opened: false,
		template: require('ejs!./dropdown.html'),
		events: {
			'click .dropdown__head': function(e) {
				this.toggle();
			},
			'click .dropdown__item': function(e) {
				var block = this;

				if (!$(e.target).hasClass('dropdown__itemDisabled')) {
					block.onItemClick(e);
				}
			}
		},
		itemsList: function(){},
		onItemClick: function(e){},
		open: function() {
			var block = this;

			block.$el.addClass('dropdown_opened');
			block.opened = true;

			var $body = block.$('.dropdown__body');
			var $content = $body.closest('.content');

			if ($content.length && $content.offset().left > $body.offset().left) {
				$body.removeClass('dropdown__body_right');
			}
 		},
		close: function() {
			var block = this;

			block.$el.removeClass('dropdown_opened');
			block.opened = false;
		},
		toggle: function() {
			var block = this;

			block.opened ? block.close() : block.open();
		}
	});
});