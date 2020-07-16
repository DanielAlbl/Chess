function Piece(id) {
	this.type;
	this.id = id;
	this.pos;
	this.moves = [];
	this.img = new THREE.Object3D();
	this.alive = true;

	this.pickImg = function() {
		let file = "Pieces/";
		switch(this.type) {
			case 1: file += "whiteRook"; break;
			case 2: file += "whiteKnight"; break;
			case 3: file += "whiteBishop"; break;
			case 4: file += "whiteQueen"; break;
			case 5: file += "whiteKing"; break;
			case 6: file += "whitePawn"; break;
			case 7: file += "blackRook"; break;
			case 8: file += "blackKnight"; break;
			case 9: file += "blackBishop"; break;
			case 10: file += "blackQueen"; break;
			case 11: file += "blackKing"; break;
			case 12: file += "blackPawn"; break;
		}
	
		let x = this.pos % 8;
		let y = Math.floor(this.pos/8);
		
		if((x+y) % 2 === 0)
			file += "Brown"

		return file + ".png";
	}

	this.setImg = function() {
		let loader = new THREE.TextureLoader();
		let material = new THREE.MeshLambertMaterial({
		  map: loader.load(this.pickImg())
		});
		let geometry = new THREE.PlaneGeometry(1, 1);
		this.img = new THREE.Mesh(geometry, material);
	
		let x = this.pos % 8;
		let y = Math.floor(this.pos/8);

		this.img.position.set(x-3.5,y-3.5,0);
	};

	this.set = function(type,pos) {
		this.type = type;
		this.pos = pos;
	}

	this.canMove = function(to) {	
		return this.moves.includes(to);
	}

	this.move = function(to) {
		if(!this.canMove(to))
			return false;
		scene.remove(this.img);
		this.pos = to;
		this.setImg();
		scene.add(this.img);
		return true;
	}

	this.remove = function() {
		scene.remove(this.img);
		score -= POINTS[this.type];
		this.alive = false;
	}


	this.getMoves = function() {
		this.moves.length = 0;

		for(let i = 0; i < board.pinned.length; i++) {
			if(board.pinned[i] === this.id)
				return false;
		}


		let kind = (this.type > 6 ? this.type-6 : this.type);

		switch(kind) {
			case 1: this.rook(); break;
			case 2: this.knight(); break;
			case 3: this.bishop(); break;
			case 4: this.queen(); break;
			case 5: this.king(); break;
			case 6: this.pawn(); break;
		}
	}


	this.sameColor = function(idx) {
		if(idx === -1)
			return false;
		if(this.type < 7 === (idx < 16))
			return true;
		return false;
	}

	this.otherColor = function(idx) {
		if(idx === -1)
			return false;
		if(this.type < 7 === (idx > 15))
			return true;
		return false;
	}

	this.multiHelper = function(con,inc,king,pinned) {
		let i = this.pos+inc;
		let hitPiece = -1;
		let piece;
		while(con(i) && !this.sameColor(board.board[i])) {
			if(hitPiece === -1)
				this.moves.push(i);
			if(this.otherColor(board.board[i])) {
				if(pinned !== -1)
					return;
				if(hitPiece !== -1) {
					if(board.board[i] === king) 
						pinned = board.board[hitPiece];
					break;
				}
				else 
					hitPiece = i;
			}
			i += inc;
		}
		return pinned;
	}

	this.singleHelper = function(off,con) {
		let idx = this.pos+off;
		if(con(idx) && !this.sameColor(board.board[idx])) 
			this.moves.push(idx);
	}

	this.pawnAttacking = function() {
		if(board.whiteTurn) {
			if(this.pos+8 < 64) {
				if(this.pos%8 !== 0 && !this.sameColor(this.pos+7))
					board.underAttack[this.pos+7] = true;
				if(this.pos%8 !== 7 && !this.sameColor(this.pos+9))
					board.underAttack[this.pos+9] = true;
			}
		}
		else {
			if(this.pos-8 > -1) {
				if(this.pos%8 !== 0 && !this.sameColor(this.pos-9))
					board.underAttack[this.pos-9] = true;
				if(this.pos%8 !== 7 && !this.sameColor(this.pos-7))
					board.underAttack[this.pos-7] = true;
			}
		}
	}


	this.rook = function() {
		let king = (board.whiteTurn ? 28 : 4);
		let pinned = -1;

		pinned = this.multiHelper(j => {return j % 8 !== 0}, 1, king, pinned );
		pinned = this.multiHelper(j => {return (j+8)%8 !== 7}, -1, king, pinned );
		pinned = this.multiHelper(j => {return j < 64}, 8, king, pinned );
		pinned = this.multiHelper(j => {return j > -1}, -8, king, pinned );

		if(pinned !== -1)
			board.pinned.push(pinned);
	}

	this.pawn = function() {
		if(this.type === 6) {
			if(this.pos > 7 && this.pos < 16) {
				if(board.board[this.pos+16] === -1)
					this.moves.push(this.pos+16);
			}
			if(this.pos+8 < 64) {
				if(board.board[this.pos+8] === -1) 
					this.moves.push(this.pos+8);
				if(this.pos%8 !== 7 && this.otherColor(board.board[this.pos+9]))
					this.moves.push(this.pos+9);
				if(this.pos%8 !== 0 && this.otherColor(board.board[this.pos+7]))
					this.moves.push(this.pos+7);
			}
		}
		else {
			if(this.pos > 47 && this.pos < 56) {
				if(board.board[this.pos-16] === -1)
					this.moves.push(this.pos-16);
			}
			if(this.pos-8 > -1) {
				if(board.board[this.pos-8] === -1) 
					this.moves.push(this.pos-8);
				if(this.pos%8 !== 0 && this.otherColor(board.board[this.pos-9]))
					this.moves.push(this.pos-9);
				if(this.pos%8 !== 7 && this.otherColor(board.board[this.pos-7]))
					this.moves.push(this.pos-7);
			}
		}
	}

	this.knight = function() {
		this.singleHelper(-10, i => {return i > -1 && (i+8)%8 < 6});
		this.singleHelper(-17, i => {return i > -1 && (i+8)%8 !== 7});
		this.singleHelper(-15, i => {return i > -1 && i%8 !== 0});
		this.singleHelper( -6, i => {return i > -1 && i%8 > 1});
		this.singleHelper( 10, i => {return i < 64 && i%8 > 1});
		this.singleHelper( 17, i => {return i < 64 && i%8 !== 0});
		this.singleHelper( 15, i => {return i < 64 && (i+8)%8 !== 7});
		this.singleHelper(  6, i => {return i < 64 && (i+8)%8 < 6});
	}

	this.bishop = function() {
		let king = (board.whiteTurn ? 28 : 4);
		let pinned = -1;

		pinned = this.multiHelper(j => {return j < 64 && (j+8)%8 !== 7 }, 7, king, pinned );
		pinned = this.multiHelper(j => {return j > -1 && (j+8)%8 !== 7}, -9, king, pinned );
		pinned = this.multiHelper(j => {return j > -1 && j%8 !== 0}, -7, king, pinned );
		pinned = this.multiHelper(j => {return j < 64 && j%8 !== 0}, 9, king, pinned );

		if(pinned !== -1)
			board.pinned.push(pinned);
	}

	this.queen = function() {
		this.rook();
		this.bishop();
	}

	this.king = function() {
		this.singleHelper( 7, i => {return i < 64 && (i+8)%8 !== 7});
		this.singleHelper(-9, i => {return i > -1 && (i+8)%8 !== 7});
		this.singleHelper(-7, i => {return i > -1 && i%8 !== 0});
		this.singleHelper( 9, i => {return i < 64 && i%8 !== 0});
		this.singleHelper(-1, i => {return (i+8)%8 !== 7});
		this.singleHelper(-8, i => {return i > -1});
		this.singleHelper( 1, i => {return i%8 !== 0});
		this.singleHelper( 8, i => {return i < 64});
		
		for(let j = 0; j < this.moves.length; j++) {
			if(board.underAttack[this.moves[j]]) {
				this.moves.splice(j,1);
				j--;
			}
		}

		if(this.type === 5) {
			if(board.canCastle[0] && !board.underAttack[4] && !board.underAttack[3]
				&& !board.underAttack[2] && board.board[3] === -1 && 
				board.board[2] === -1 && board.board[1] === -1)
				this.moves.push(2);
			if(board.canCastle[1] && !board.underAttack[4] && !board.underAttack[5]
				&& !board.underAttack[6] && board.board[5] === -1 && board.board[6] === -1) 
				this.moves.push(6);
		}
		else {
			if(board.canCastle[2] && !board.underAttack[60] && !board.underAttack[59]
				&& !board.underAttack[58] && board.board[59] === -1 && 
				board.board[58] === -1 && board.board[57] === -1)
				this.moves.push(58);
			if(board.canCastle[3] && !board.underAttack[60] && !board.underAttack[61]
				&& !board.underAttack[62] && board.board[61] === -1 && board.board[62] === -1)
				this.moves.push(62);
		}
	}
}
