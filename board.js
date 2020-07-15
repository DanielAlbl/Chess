function Board() {
	this.board = new Array(64).fill(-1);
	this.pieces = [];
	this.underAttack = new Array(64).fill(false);
	this.whiteTurn = true;
	// wq, wk, bq, bk //
	this.canCastle = new Array(4).fill(true);
	this.check = false;
	this.checkMate = false;
	this.kingAttackers = [];
	this.pinned = [];
	
	this.setup = function() {
		for(let i = 0; i < 16; i++)
			this.board[i] = i;
		for(let i = 48; i < 64; i++)
			this.board[i] = i-32;
	}

	this.setup();

	this.handleCheck = function(start,end) {
		let king = (this.whiteTurn ? this.pieces[4].pos : this.pieces[28].pos);

		let savePiece, spliced;
		let saveMoves = [[]];
		let totalMoves = 0;
		for(let i = 0; i < this.kingAttackers.length; i++)
			saveMoves.push(this.pieces[this.kingAttackers[i]].moves);

		for(let i = start; i < end; i++) {
			if(this.pieces[i].alive) {
				this.board[this.pieces[i].pos] = -1;
				for(let j = 0; j < this.pieces[i].moves.length; j++) {
					savePiece = this.board[this.pieces[i].moves[j]];
					this.board[this.pieces[i].moves[j]] = i;

					spliced = false;

					for(let k = 0; k < this.kingAttackers.length; k++) {
						this.pieces[this.kingAttackers[k]].getMoves();
						if(this.pieces[this.kingAttackers[k]].pos !== this.pieces[i].moves[j] 
							&& this.pieces[this.kingAttackers[k]].moves.includes(king)) {
							this.pieces[i].moves.splice(j,1);
							spliced = true;
							break;
						}
					}

					this.board[this.pieces[i].moves[j]] = savePiece;

					if(spliced)
						j--;
				}
				this.board[this.pieces[i].pos] = i;
				totalMoves += this.pieces[i].moves.length;	
			}
		}

		for(let i = 0; i < this.kingAttackers.length; i++)
			this.pieces[this.kingAttackers[i]].moves = saveMoves[i];

		return totalMoves;
	}

	this.getMoves = function(white) {
		let start = (white ? 0 : 16); 
		let end = (white ? 16 : 32);

		for(let i = start; i < end; i++) {
			if(this.pieces[i].alive)
				this.pieces[i].getMoves();
		}

		if(this.check) {
			if(!this.handleCheck(start,end))
				this.checkMate = true;
		}
	}

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

	this.setUnderAttack = function() {
		for(let i = 0; i < 64; i++)
			this.underAttack[i] = false;

		let i, end;
		if(this.whiteTurn) {
			i = 0;
			end = 16;
		}
		else {
			i = 16;
			end = 32;
		}

		this.check = false;
		this.kingAttackers.length = 0;
		for(; i < end; i++) {
			if(this.pieces[i].alive) {
				for(let j = 0; j < this.pieces[i].moves.length; j++) {
					this.underAttack[this.pieces[i].moves[j]] = true;
					if(this.pieces[i].moves[j] === this.pieces[4].pos ||
						this.pieces[i].moves[j] === this.pieces[28].pos) {
						this.check = true;
						this.kingAttackers.push(i);
					}
				}
			}
		}
	}

	this.switchPlayer = function() {
		this.getMoves(this.whiteTurn);
		this.setUnderAttack();
		this.whiteTurn = !this.whiteTurn;
		this.getMoves(this.whiteTurn);
		console.log(this.pieces[16].moves);
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
		this.board[fm] = -1;
		this.board[to] = rk;
	}

	this.checkForCastle = function(from,to) {
		if(this.board[from] === 4) {
			if(to === 2) 
				this.castleHelper(0,0,3);
			else if(to === 6) 
				this.castleHelper(7,7,5);
		}
		else if(this.board[from] === 28) {
			if(to === 58) 
				this.castleHelper(24,56,59);
			else if(to === 62) 
				this.castleHelper(31,63,61);
		}
	}

	this.move = function(from,to) {
		let piece = this.board[from];
		if(this.whiteTurn && piece > 15 || 
			!this.whiteTurn && piece < 16)
			return;

		let capture = this.board[to];

		if(this.pieces[piece].move(to)) {
			this.checkForCastle(from,to);
			this.updateCastling(piece);

			if(capture != -1) 
				this.pieces[capture].remove();

			this.board[from] = -1;
			this.board[to] = piece;
		
			this.switchPlayer();
	
			return true;
		}
		else
			return false;
	}

	this.canSelect = function(i) {
		let piece = this.board[i];
		if(piece === -1)
			return false;
		if(this.whiteTurn === (piece < 16))
			return true;
		return false;
	}
}
