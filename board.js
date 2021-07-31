function Board() {
	this.board = new Array(64).fill(-1);
	this.king = 4;
	
	this.pieces = [];

	this.whiteTurn = true;
	// wq, wk, bq, bk //
	this.canCastle = new Array(4).fill(true);
	this.checkMate = false;

	this.score = 0;

	this.setup = function() {
		for(let i = 0; i < 16; i++)
			this.board[i] = i;
		for(let i = 48; i < 64; i++)
			this.board[i] = i-32;
	}

	this.setup();

	this.setPieces = function() {
		for(let i = 0; i < 32; i++)
			this.pieces.push(new Piece(i));

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
			this.pieces[i].getMoves();
			scene.add(this.pieces[i].img);
		}
	}

	this.getDirHelper = function(off) {
		if(off % 9 === 0) return 9;
		if(off % 8 === 0) return 8;
		if(off % 7 === 0) return 7;
		return 1;
	}

	this.getDir = function(king,atk) {
		if(king < atk) 
			return this.getDirHelper(atk-king);
		else 
			return -this.getDirHelper(king-atk);
	}
	
	this.updateCastling = function(piece) {
		if(piece === 4) {
			this.canCastle[0] = false;
			this.canCastle[1] = false;
		}
		else if(piece === 28) {
			this.canCastle[2] = false;
			this.canCastle[3] = false;
		}
		else if(piece === 0 ) this.canCastle[0] = false;
		else if(piece === 7 ) this.canCastle[1] = false;
		else if(piece === 24) this.canCastle[2] = false;
		else if(piece === 31) this.canCastle[3] = false;
	}

	this.castleHelper = function(rk,fm,to) {
		this.pieces[rk].move(to);
		return rk;
	}

	this.checkForCastle = function(from,to) {
		if(this.board[from] === 4 && from === 4) {
			if(to === 2) 
				return this.castleHelper(0,0,3);
			if(to === 6) 
				return this.castleHelper(7,7,5);
		}
		else if(this.board[from] === 28 && from === 60) {
			if(to === 58) 
				return this.castleHelper(24,56,59);
			if(to === 62) 
				return this.castleHelper(31,63,61);
		}
		return -1;
	}

	this.getMoves = function() {
		let st1, st2, ed1, ed2;
		if(this.whiteTurn) 
			st1 = 0, st2 = 16, ed1 = 16, ed2 = 32;
		else
			st1 = 16, st2 = 0, ed1 = 32, ed2 = 16;
		
		for(let i = st1; i < ed1; i++) {
			this.pieces[i].getMoves();
			this.pieces[i].moves.forEach(move => {
				let pos = this.pieces[i].pos;
				let cap = this.board[move] === -1 ? null : this.pieces[this.board[move]];

				if(cap !== null) 
					cap.alive = false;
				this.pieces[i].movePos(move);

				for(let j = st2; j < ed2; j++)
					if(this.pieces[j].isChecking()) {
						this.pieces[i].moves.delete(move);
						break;
					}

				if(cap !== null) {
					cap.alive = true;
					this.pieces[i].movePos(pos, cap.id);
				}
				else
					this.pieces[i].movePos(pos);
			});
		}
	}
	
	this.move = function(from,to,saveBoard) {
		let piece = this.board[from];
		if(this.whiteTurn === piece > 15 || piece === -1)
			return false;

		if(this.pieces[piece].canMove(to)) {
			this.checkForCastle(from,to);
			this.updateCastling(piece);

			if(this.board[to] !== -1) 
				this.pieces[this.board[to]].remove();

			this.pieces[piece].move(to);

			this.whiteTurn = !this.whiteTurn;
			this.king = this.whiteTurn ? 4 : 28;

			this.getMoves();

  			return true;
		}
		else
			return false;
	}

	this.canSelect = function(i) {
		let piece = this.board[i];
		if(piece === -1) return false;
		return this.whiteTurn === piece < 16;
	}
}
