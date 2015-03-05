var YearView = fcViews.year = BasicView.extend({ // make a subclass of View

	initialize: function() {
		this.dayGrid = new MonthGrid(this);
		this.coordMap = this.dayGrid.coordMap; // the view's date-to-cell mapping is identical to the subcomponent's
	},

	// Compute the value to feed into setRange. Use base class version.
	computeRange: function(date) {
		return View.prototype.computeRange.call(this, date); // get value from the super-method
	},
	// Renders the view into `this.el`, which should already be assigned
	render: function() {
		this.el.html(this.renderHtml());
		this.headRowEl = $(); // This element is not in the year view
		this.scrollerEl = this.el.find('.fc-month-grid-container');
		this.dayGrid.coordMap.containerEl = this.scrollerEl; // constrain clicks/etc to the dimensions of the scroller

		this.dayGrid.setElement(this.el.find('.fc-month-grid'));
		this.dayGrid.renderDates(this.hasRigidRows());
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
	}
});


YearView.duration = { years: 1 };
YearView.defaults = {
	monthsPerRow: 3,
	monthPopoverFormat: 'MMMM'
};

