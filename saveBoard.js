function SaveBoard()  {
	this.captured;
	this.canCastle = new Array(4).fill(true);

	this.from;
	this.to;

	this.save = function(board,from,to,captured) {
		this.canCastle = board.canCastle.slice();
		this.from = from;
		this.to = to;
		this.captured = captured;
	}

	this.reset = function(board) {
		board.canCastle = this.canCastle.slice();
		board.pieces[board.board[this.to]].move(this.from);

		board.whiteTurn = !board.whiteTurn;
		board.king = board.whiteTurn ? 4 : 28;

		board.pieces[board.king].clearMoves();
		board.pieces[board.king].getMoves();

		board.setPinned(board.whiteTurn);
		board.setCheckMoves(board.whiteTurn);
	}
}
