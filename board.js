function Board() {
	this.board = new Array(64).fill(-1);
	this.pieces = [];
	
	this.setup = function() {
		for(let i = 0; i < 16; i++)
			this.board[i] = i;
		for(let i = 48; i < 64; i++)
			this.board[i] = i-32;

		for(let i = 0; i < 32; i++)
			this.pieces.push(new Piece());

		for(let i = 0; i < 5; i++)
			this.pieces[i].set(i+1,i);
		for(let i = 5; i < 8; i++)
			this.pieces[i].set(8-i,i);
		for(let i = 8; i < 16; i++)
			this.pieces[i].set(6,i);

		for(let i = 16; i < 24; i++)
			this.pieces[i].set(12,i+32);
		for(let i = 24; i < 29; i++)
			this.pieces[i].set(i-17,i+32);
		for(let i = 29; i < 32; i++)
			this.pieces[i].set(38-i,i+32);

		for(let i = 0; i < 32; i++) {
			this.pieces[i].setImg();
			scene.add(this.pieces[i].img);
		}
	}

	this.setup();

	this.move = function(from,to) {
		let piece = this.board[from];
		let capture = this.board[to];
		
		if(this.pieces[piece].move(to)) {
			if(capture != -1) 
				this.pieces[capture].remove();

			this.board[from] = -1;
			this.board[to] = piece;
			return true;
		}
		else
			return false;
	}

	this.rook = function(i) {
		let j = i+1;
		while(j < 8 && board[j] == 0) {}
	}

}
