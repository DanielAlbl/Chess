function Board() {
	this.board = new Array(64).fill(-1);
	this.whiteAtk = [];
	this.blackAtk = [];
	
	this.pieces = [];

	this.whiteTurn = true;
	// wq, wk, bq, bk //
	this.canCastle = new Array(4).fill(true);
	this.check = false;
	this.checkMate = false;

	this.pinned = new Set();

	this.setup = function() {
		for(let i = 0; i < 16; i++)
			this.board[i] = i;
		for(let i = 48; i < 64; i++)
			this.board[i] = i-32;

		for(let i = 0; i < 64; i++) {
			this.whiteAtk.push(new Set());
			this.blackAtk.push(new Set());
		}
	}

	this.setup();

	this.handleCheck = function(start,end,kingAtk) {
		let kingIdx = (this.whiteTurn ? 4 : 28);
		let king = this.pieces[kingIdx].pos;

		let savePiece, saveIdx;
		let saveMoves = [[]];
		let totalMoves = 0;
		for(let i = 0; i < kingAtk.length; i++)
			saveMoves.push(this.pieces[kingAtk[i]].moves);

		for(let i = start; i < end; i++) {
			if(this.pieces[i].alive && i !== kingIdx) {
				this.board[this.pieces[i].pos] = -1;
				for(let j = 0; j < this.pieces[i].moves.length; j++) {
					savePiece = this.board[this.pieces[i].moves[j]];
					saveIdx = this.pieces[i].moves[j];
					this.board[this.pieces[i].moves[j]] = i;

					spliced = false;

					for(let k = 0; k < kingAtk.length; k++) {
						this.pieces[kingAtk[k]].getMoves();
						if(this.pieces[kingAtk[k]].pos !== this.pieces[i].moves[j] 
							&& this.pieces[kingAtk[k]].moves.includes(king)) {
							this.pieces[i].moves.splice(j,1);
							j--;
							break;
						}
					}

					this.board[saveIdx] = savePiece;
				}
				this.board[this.pieces[i].pos] = i;
				totalMoves += this.pieces[i].moves.length;	
			}
		}

		for(let k = 0; k < kingAtk.length; k++)
			this.pieces[kingAtk[k]].moves = saveMoves[k];

		return totalMoves;
	}

	this.getMoves = function(white) {
		let start = (white ? 0 : 16); 
		let end = (white ? 16 : 32);

		for(let i = start; i < end; i++) {
			if(this.pieces[i].alive)
				this.pieces[i].getMoves();
		}

		let kingAtk = (white ? this.blackAtk[this.pieces[4].pos]
			: this.whiteAtk[this.pieces[28].pos]);

		if(kingAtk.length) {
			if(!this.handleCheck(start,end,kingAtk))
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

	this.pinnedHelper = function(king,sameColor,inc,canPin,cnd) {
		let idx = king+inc;
		let hitPiece = -1;

		while(cnd(idx)) {
			if(this.board[idx] !== -1) {
				if(sameColor(this.board[idx])) {
					if(hitPiece === -1)
						hitPiece = this.board[idx];
					else
						return;
				}
				else {
					if(hitPiece === -1)
						return;
					else {
						if(canPin(this.pieces[this.board[idx]].type))
							this.pinned.add(hitPiece);
						return;
					}
				}
			}
			idx += inc;
		}
	}

	this.setPinned = function(white) {
		this.pinned.clear();

		let king = (white ? this.pieces[4].pos : this.pieces[28].pos);
		let sameColor = (white ? i => {return i < 16} : i => {return i >= 16});
	
		let rook, bish;
		if(white) {
			rook = i => { return i === 7 || i === 10 };
			bish = i => { return i === 9 || i === 10 };
		}
		else {
			rook = i => { return i === 1 || i === 4 };
			bish = i => { return i === 3 || i === 4 };
		}

		this.pinnedHelper(king, sameColor,  7, bish, BISHOP_BOUNDS.get( 7)); 
		this.pinnedHelper(king, sameColor, -9, bish, BISHOP_BOUNDS.get(-9)); 
		this.pinnedHelper(king, sameColor, -7, bish, BISHOP_BOUNDS.get(-7));    
		this.pinnedHelper(king, sameColor,  9, bish, BISHOP_BOUNDS.get( 9));    	
		this.pinnedHelper(king, sameColor, -1, rook, ROOK_BOUNDS.get(-1)); 
		this.pinnedHelper(king, sameColor, -8, rook, ROOK_BOUNDS.get(-8)); 
		this.pinnedHelper(king, sameColor,  1, rook, ROOK_BOUNDS.get( 1)); 
		this.pinnedHelper(king, sameColor,  8, rook, ROOK_BOUNDS.get( 8)); 
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
		if(this.whiteTurn === (piece > 15))
			return false;

		let capture = this.board[to];

		if(this.pieces[piece].canMove(to)) {
			this.checkForCastle(from,to);
			this.updateCastling(piece);

			if(capture !== -1) 
				this.pieces[capture].remove();

			this.pieces[piece].move(to);
		
			this.whiteTurn = !this.whiteTurn;

			this.setPinned(this.whiteTurn);

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
