function Piece() {
	this.type;
	this.pos;
	this.moves = [];
	this.img = new THREE.Object3D();

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

	this.move = function(to) {
		scene.remove(this.img);
		this.pos = to;
		this.setImg();
		scene.add(this.img);
		return true;
	}

	this.remove = function() {
		scene.remove(this.img);
		score -= POINTS[this.type];
	}


}
