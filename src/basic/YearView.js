YearView = fcViews.year = View.extend({ // make a subclass of View
	monthGrid: null, // the main subcomponent that does most of the heavy lifting

	initialize: function() {
		this.monthGrid = new MonthGrid(this);
		this.monthGrid.monthsPerRow
	},

	render: function() {
		this.el.html(this.renderHtml());
		this.monthGrid.setElement(this.el.find('.fc-month-grid'));
		this.monthGrid.renderDates();
	},

	// Unrenders the content of the view
	destroy: function() {
		this.monthGrid.destroyDates();
		this.monthGrid.removeElement();
	},

	// Builds the HTML skeleton for the view.
	// The month grid component will render inside of a container defined by this HTML.
	renderHtml: function() {
		return '' +
			'<table>' +
				'<tbody class="fc-body">' +
					'<tr>' +
						'<td class="' + this.widgetContentClass + '">' +
							'<div class="fc-month-grid-container">' +
								'<div class="fc-month-grid"/>' +
							'</div>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>';
	},

	// Sets the display range and computes all necessary dates
	setRange: function(range) {
		View.prototype.setRange.call(this, range); // call the super-method
		this.monthGrid.setRange(range);
	},


	setHeight: function(height, isAuto) {
		this.setGridHeight(height, isAuto);
	},

	// Sets the height of just the MonthGrid component in this view
	setGridHeight: function(height, isAuto) {
		if (isAuto) {
			undistributeHeight(this.monthGrid.rowEls); // let the rows be their natural height with no expanding
		}
		else {
			distributeHeight(this.monthGrid.rowEls, height, true); // true = compensate for height-hogging rows
		}
	},

	renderEvents: function(events) {
		this.monthGrid.renderEvents(events);
	},

	destroyEvents: function() {
		this.monthGrid.destroyEvents();
	},

	renderSelection: function(range) {
		this.monthGrid.renderSelection(range);
	},

	destroySelection: function() {
		this.monthGrid.destroySelection();
	}

});


YearView.duration = { years: 1 };

