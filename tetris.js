//Declare global object tetris:
var tetris = {};
var MAX_ROW = 22; //Number of Rows
var MAX_COL = 10; //Number of Cols
var gamePlay;


//Origin and Shape:
tetris.origin = {row:1,col:5};
tetris.currentShape = 'S';
tetris.gameOver = false;


var colorMap = {};
colorMap['I'] = 'Cyan';
colorMap['J'] = 'Blue';
colorMap['L'] = 'Orange';
colorMap['O'] = 'Yellow';
colorMap['S'] = 'LawnGreen';
colorMap['T'] = 'Purple';
colorMap['Z'] = 'Red';

tetris.color = colorMap[tetris.currentShape];

//Boundary Check:
tetris.boundCheck = function(direction) {
	for(var i = 0; i<this.currentCoor.length; i++) {
		if(this.currentCoor[i].col>(MAX_COL-1))
			this.move('left');
		else if(this.currentCoor[i].col<0)
			this.move('right');
		else if(this.currentCoor[i].row>(MAX_ROW-1)) {
			this.color = "BLACK";
			this.move('up');
		}
		else if(this.currentCoor[i].row<0) //Should NEVER happen
			this.move('down');
	}
}

//Rotate Shape:
tetris.rotateShape = function() {
	if(this.currentShape === 'O' || this.gameOver)
		return;
	var newCoor = this.currentCoor;
	this.fillCells(this.currentCoor, '');
	for(var i = 1; i<this.currentCoor.length; i++) {
		//Apply Rotation Matrix:
		var newCol = (0*(this.currentCoor[i].col-this.currentCoor[0].col))+(1*(this.currentCoor[i].row-this.currentCoor[0].row));
		var newRow = (-1*(this.currentCoor[i].col-this.currentCoor[0].col))+(0*(this.currentCoor[i].row-this.currentCoor[0].row));

		newCoor[i].col = newCol+this.currentCoor[0].col;
		newCoor[i].row = newRow+this.currentCoor[0].row;
	}

	if(this.safeMove('rotation', newCoor))
		this.currentCoor = newCoor;

	tetris.boundCheck();
	this.fillCells(this.currentCoor, this.color)
}

//Shape to Current Coordinate Conversion
tetris.shapeToCoor = function(shape, origin) {
	if(shape === 'I') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row, col:origin.col+1},
				{row:origin.row, col:origin.col-1},
				{row:origin.row, col:origin.col+2}];
	}

	if(shape === 'J') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row-1, col:origin.col},
				{row:origin.row+1, col:origin.col},
				{row:origin.row+1, col:origin.col-1}];
	}

	if(shape === 'L') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row-1, col:origin.col},
				{row:origin.row+1, col:origin.col},
				{row:origin.row+1, col:origin.col+1}];
	}

	if(shape === 'O') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row, col:origin.col+1},
				{row:origin.row+1, col:origin.col},
				{row:origin.row+1, col:origin.col+1}];
	}

	if(shape === 'S') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row, col:origin.col+1},
				{row:origin.row+1, col:origin.col},
				{row:origin.row+1, col:origin.col-1}];
	}

	if(shape === 'Z') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row, col:origin.col-1},
				{row:origin.row+1, col:origin.col},
				{row:origin.row+1, col:origin.col+1}];
	}

	if(shape === 'T') {
		return [{row:origin.row, col:origin.col},
				{row:origin.row, col:origin.col-1},
				{row:origin.row, col:origin.col+1},
				{row:origin.row+1, col:origin.col}];
	}
}

//Set Current Coordinates:
tetris.currentCoor = tetris.shapeToCoor(tetris.currentShape, tetris.origin);

//Draw the grid:
tetris.drawPlayField = function() {
	for(var row=0; row<MAX_ROW; row++) {
		$('#playfield').append('<tr class="'+row+'"></tr>');
		for(var col=0; col<MAX_COL; col++) {
			$('tr.'+row).append('<td id="'+col+'"></td>');
		}
	}
}

//Fill the cells:
tetris.fillCells = function(coordinates, fillColor) {
	for(var i=0; i<coordinates.length; i++){
		var row = coordinates[i].row;
		var col = coordinates[i].col;
		var $coor = $('.'+row).find('#'+col);
		$coor.attr('bgcolor', fillColor);
	}
}

//Empty a full row:
tetris.emptyFullRow = function() {
	console.log('Enter Empty FullRow!');
	var rowRunner;
	var dropCount = 0;
	var firstFullRow;
	for(rowRunner=(MAX_ROW-1); rowRunner>=0; rowRunner--){
		var rowFull = true;
		var rowEmpty = true;

		for(var j=0; j<MAX_COL; j++) {
			if($('.'+rowRunner).find('#'+j).attr('bgcolor') === 'BLACK') //If any cell is black, row cannot be empty
				rowEmpty = false;
			if($('.'+rowRunner).find('#'+j).attr('bgcolor') !== 'BLACK') //If any cell is !black, row cannot be full
				rowFull = false;
		}

		if(rowFull === true) {
			if(firstFullRow === undefined)
				firstFullRow = rowRunner;
			dropCount++; //dropCount is the number of completely filled rows
		}
		if(rowEmpty === true)
			break; //rowRunner is now the first empty row from the bottom
	}

	for(var i=(firstFullRow-dropCount); i>=(rowRunner-dropCount); i--) {
		for(j=0; j<MAX_COL; j++) {
			var fillColor = $('.'+i).find('#'+j).attr('bgcolor');
			$('.'+(i+dropCount)).find('#'+j).attr('bgcolor', fillColor);
		}
	}

}

//Spawn random shape:
tetris.spawn = function() {
	console.log('Enter Spawn!');
	var random = Math.floor(Math.random()*7);
	var shapeArray = ['I','J','L','O','S','Z','T'];
	this.currentShape = shapeArray[random];
	this.origin = {row:1,col:5};
	this.color = colorMap[this.currentShape];
	this.currentCoor = this.shapeToCoor(this.currentShape, this.origin);
}

//Drop shape by one row or all the way if spacebar:
tetris.drop = function(input) {
	var spawn = false;
	
	if(input === 'spacebar') {
		for(var i=0; i<MAX_ROW; i++)
			this.move('down');
	} else
		this.move('down');

	if(this.color === 'BLACK')
		var spawn = true;

	if($('.'+(tetris.origin.row)).find('#'+(tetris.origin.col)).attr('bgcolor') === 'BLACK') {
		clearInterval(gamePlay);
		this.gameOver = true;
		spawn = false;
	}

	if(spawn === true) {
		this.emptyFullRow();
		this.spawn();
	}
}

//Check if move is blocked by black cells:
tetris.safeMove = function(direction, newCoordinates) {
	if(direction !== 'rotation') {
		for(var i=0; i<this.currentCoor.length; i++) {
			if(direction === 'right' && $('.'+(this.currentCoor[i].row)).find('#'+(this.currentCoor[i].col+1)).attr('bgcolor') === 'BLACK')
				return false;
			else if(direction === 'left' && $('.'+(this.currentCoor[i].row)).find('#'+(this.currentCoor[i].col-1)).attr('bgcolor') === 'BLACK')
				return false;
			else if(direction === 'down' && $('.'+(this.currentCoor[i].row+1)).find('#'+(this.currentCoor[i].col)).attr('bgcolor') === 'BLACK')
				return false;
			else if(direction === 'up' && $('.'+(this.currentCoor[i].row-1)).find('#'+(this.currentCoor[i].col)).attr('bgcolor') === 'BLACK')
				return false;
		}
	} else if(direction === 'rotation') {
		for(var i=0; i<newCoordinates.length; i++) {
			if($('.'+newCoordinates[i].row).find('#'+newCoordinates[i].col).attr('bgcolor') === 'BLACK')
				return false
		}
	}

	return true;
}

//Move the shape
tetris.move = function(direction) {
	var safe = this.safeMove(direction);

	if(safe) {
		this.fillCells(this.currentCoor, '');
		for(var i=0; i<this.currentCoor.length; i++) {
			if(direction === 'right')
				this.currentCoor[i].col++;
			else if(direction === 'left')
				this.currentCoor[i].col--;
			else if(direction === 'down') 
				this.currentCoor[i].row++;
			else if(direction === 'up')
				this.currentCoor[i].row--;
		}
		this.boundCheck(direction);
	} else if(!safe && direction == 'down')
		this.color = 'BLACK';
	this.fillCells(this.currentCoor, this.color);
}

$(document).ready(function() {
	tetris.drawPlayField();
	tetris.fillCells(tetris.currentCoor, tetris.color);

	$(document).keydown(function(e) {
		//console.log(e.keyCode);
		if(e.keyCode === 37)
			tetris.move('left');
		else if(e.keyCode === 39)
			tetris.move('right');
		else if(e.keyCode === 38)
			tetris.rotateShape();
		else if(e.keyCode === 40)
			tetris.drop();
		else if(e.keyCode === 32)
			tetris.drop('spacebar');
	})

	gamePlay = setInterval(function(){
		tetris.drop();
	}, 500);
	
})