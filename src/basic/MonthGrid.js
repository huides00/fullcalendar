MonthGrid = DayGrid.extend({
	monthsPerRow: 3,


	constructor: function() {
		Grid.apply(this, arguments);

		this.cellDuration = moment.duration(1, 'month'); // for Grid system
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

		this.colCnt = this.monthsPerRow;
		this.rowCnt = 12 / this.colCnt;
	},


	// Populates cellDates and dayToCellOffsets
	updateCellDates: function() {
		var view = this.view;
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
});


