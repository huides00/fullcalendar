var MonthGrid = DayGrid.extend({

	constructor: function() {
		Grid.apply(this, arguments);

		this.cellDuration = moment.duration(1, 'month'); // for Grid system
	},

	/* Dates
	------------------------------------------------------------------------------------------------------------------*/


	// Tells the grid about what period of time to display. Grid will subsequently compute dates for cell system.
	setRange: function(range) {
		var view = this.view;
		this.eventDateSameMonthFormat =
			view.opt('eventDateSameMonthFormat') ||
			'D';
		this.eventDateDifferentMonthFormat =
			view.opt('eventDateDifferentMonthFormat') ||
			'MMM D';
		this.eventDateDifferentYearFormat =
			view.opt('eventDateDifferentYearFormat') ||
			'MMM D, YYYY';
		DayGrid.prototype.setRange.apply(this, arguments); // calls the super-method
	},

	// Computes a default `displayEventEnd` value if one is not expliclty defined
	computeDisplayEventEnd: function() {
		return true;
	},

	// Generates the HTML for a single row. `row` is the row number.
	dayRowHtml: function(row, isRigid) {
		var view = this.view;
		var classes = [ 'fc-row', view.widgetContentClass ];

		if (isRigid) {
			classes.push('fc-rigid');
		}

		return '' +
			'<div class="' + classes.join(' ') + '">' +
				'<div class="fc-bg">' +
					'<table>' +
						this.rowHtml('month', row) + // leverages RowRenderer. calls monthCellHtml()
					'</table>' +
				'</div>' +
				'<div class="fc-content-skeleton">' +
					'<table>' +
						'<thead>' +
							this.rowHtml('monthName', row) + // leverages RowRenderer. View will define render method
						'</thead>' +
					'</table>' +
				'</div>' +
			'</div>';
	},

	// Renders the HTML for a single-month background cell
	monthCellHtml: function(cell) {
		var view = this.view;
		var date = cell.start;
		var classes = this.getMonthClasses(date);

		classes.unshift('fc-day fc-month', view.widgetContentClass);

		return '<td class="' + classes.join(' ') + '"' +
			' data-date="' + date.format('YYYY-MM-DD') + '"' + // if date has a time, won't format it
				'></td>';
	},

	// Computes HTML classNames for a single-month cell
	getMonthClasses: function(date) {
		var view = this.view;
		var today = view.calendar.getNow().stripTime();
		var classes = [];

		if (date.isSame(today, 'month')) {
			classes.push(
				'fc-today',
				view.highlightStateClass
			);
		}
		else if (date < today) {
			classes.push('fc-past');
		}
		else {
			classes.push('fc-future');
		}

		return classes;
	},

	// Generates the HTML for the <td>s of the "month name" row in the content skeleton.
	monthNameCellHtml: function(cell) {
		var date = cell.start;
		var classes;

		classes = this.getMonthClasses(date);
		classes.unshift('fc-month-name');

		return '' +
			'<th class="' + classes.join(' ') + '" data-date="' + date.format() + '">' +
				date.format(this.colHeadFormat) +
					'</th>';
	},

	/* Cell System
	------------------------------------------------------------------------------------------------------------------*/

	// Initializes row/col information
	updateCells: function() {
		this.updateCellDates(); // populates cellDates and dayToCellOffsets

		this.colCnt = this.view.opt('monthsPerRow');
		this.rowCnt = 12 / this.colCnt;
	},


	// Populates cellDates and dayToCellOffsets
	updateCellDates: function() {
		var date = this.start.clone();
		var dates = [];
		var offset = -1;
		var offsets = [];

		while (date.isBefore(this.end)) { // loop each month from start to end
			offset++;
			offsets.push(offset);
			dates.push(date.clone());
			date.add(1, 'month');
		}

		this.cellDates = dates;
		this.dayToCellOffsets = offsets;
	},


	// Given a date, returns its chronolocial cell-offset from the first cell of the grid.
	// If before the first offset, returns a negative number.
	// If after the last offset, returns an offset past the last cell offset.
	// Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
	dateToCellOffset: function(date) {
		var offsets = this.dayToCellOffsets;
		var month = date.diff(this.start, 'months');

		if (month < 0) {
			return offsets[0] - 1;
		}
		else if (month >= offsets.length) {
			return offsets[offsets.length - 1] + 1;
		}
		else {
			return offsets[month];
		}
	},

	/* Options
	------------------------------------------------------------------------------------------------------------------*/

	// Computes a default column header formatting string if `colFormat` is not explicitly defined
	computeColHeadFormat: function() {
		return 'MMMM'; // "January"
	},


	// Builds the inner DOM contents of the segment popover
	renderSegPopoverContent: function(cell, segs) {
		var view = this.view;
		var isTheme = view.opt('theme');
		var title = cell.start.format(view.opt('monthPopoverFormat'));
		var content = $(
			'<div class="fc-header ' + view.widgetHeaderClass + '">' +
				'<span class="fc-close ' +
					(isTheme ? 'ui-icon ui-icon-closethick' : 'fc-icon fc-icon-x') +
				'"></span>' +
				'<span class="fc-title">' +
					htmlEscape(title) +
				'</span>' +
				'<div class="fc-clear"/>' +
			'</div>' +
			'<div class="fc-body ' + view.widgetContentClass + '">' +
				'<div class="fc-event-container"></div>' +
			'</div>'
		);
		var segContainer = content.find('.fc-event-container');
		var i;

		// render each seg's `el` and only return the visible segs
		segs = this.renderFgSegEls(segs, true); // disableResizing=true
		this.popoverSegs = segs;

		for (i = 0; i < segs.length; i++) {

			// because segments in the popover are not part of a grid coordinate system, provide a hint to any
			// grids that want to do drag-n-drop about which cell it came from
			segs[i].cell = cell;

			segContainer.append(segs[i].el);
		}

		return content;
	},

	// Given the events within an array of segment objects, reslice them to be in a full month
	resliceDaySegs: function(segs, dayDate) {

		// build an array of the original events
		var events = $.map(segs, function(seg) {
			return seg.event;
		});

		var dayStart = dayDate.clone().stripTime();
		var dayEnd = dayStart.clone().add(1, 'month');
		var dayRange = { start: dayStart, end: dayEnd };

		// slice the events with a custom slicing function
		segs = this.eventsToSegs(
			events,
			function(range) {
				var seg = intersectionToSeg(range, dayRange); // undefind if no intersection
				return seg ? [ seg ] : []; // must return an array of segments
			}
		);

		// force an order because eventsToSegs doesn't guarantee one
		segs.sort(compareSegs);

		return segs;
	},

	// Compute the text that should be displayed on an event's element.
	getEventTimeText: function(range, formatStr, displayEnd) {

		if (displayEnd == null) {
			displayEnd = this.displayEventEnd;
		}

		if (displayEnd && range.end) {
			if (formatStr == null) {
				if(range.start.year() != range.end.year()) {
					formatStr = this.eventDateDifferentYearFormat;
				}
				else if(range.start.month() != range.end.month()) {
					formatStr = this.eventDateDifferentMonthFormat;
				}
				else {
					formatStr = this.eventDateSameMonthFormat;
				}
			}

			return this.view.formatRange(range, formatStr);
		}
		else {
			if (formatStr == null) {
				formatStr = this.eventDateSameMonthFormat;
			}

			return range.start.format(formatStr);
		}

		return '';
	}

});


