/*
	Copyright (c) 2012, The Chinese University of Hong Kong

	This program is free software: you can redistribute it and/or mody
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

var iview = (function() {

	COVALENT = {
		'H ': 0.407,
		'HD': 0.407,
		'C ': 0.847,
		'A ': 0.847,
		'N ': 0.825,
		'NA': 0.825,
		'OA': 0.803,
		'S ': 1.122,
		'SA': 1.122,
		'Se': 1.276,
		'P ': 1.166,
		'F ': 0.781,
		'Cl': 1.089,
		'Br': 1.254,
		'I ': 1.463,
		'Zn': 1.441,
		'Fe': 1.375,
		'Mg': 1.430,
		'Ca': 1.914,
		'Mn': 1.529,
		'Cu': 1.518,
		'Na': 1.694,
		'K ': 2.156,
		'Hg': 1.639,
		'Ni': 1.331,
		'Co': 1.386,
		'Cd': 1.628,
		'As': 1.309,
		'Sr': 2.112,
	};

	AD2XS = {
		'C ':   'C_H',
		'A ':   'C_H',
		'N ':   'N_P',
		'NA':   'N_A',
		'OA':   'O_A',
		'S ':   'S_P',
		'SA':   'S_P',
		'Se':   'S_P',
		'P ':   'P_P',
		'F ':   'F_H',
		'Cl':  'Cl_H',
		'Br':  'Br_H',
		'I ':   'I_H',
		'Zn': 'Met_D',
		'Fe': 'Met_D',
		'Mg': 'Met_D',
		'Ca': 'Met_D',
		'Mn': 'Met_D',
		'Cu': 'Met_D',
		'Na': 'Met_D',
		'K ': 'Met_D',
		'Hg': 'Met_D',
		'Ni': 'Met_D',
		'Co': 'Met_D',
		'Cd': 'Met_D',
		'As': 'Met_D',
		'Sr': 'Met_D',
	};

	VDW = {
		  'C_H' : 1.9,
		  'C_P' : 1.9,
		  'N_P' : 1.8,
		  'N_D' : 1.8,
		  'N_A' : 1.8,
		  'N_DA': 1.8,
		  'O_A' : 1.7,
		  'O_DA': 1.7,
		  'S_P' : 2.0,
		  'P_P' : 2.1,
		  'F_H' : 1.5,
		 'Cl_H' : 1.8,
		 'Br_H' : 2.0,
		  'I_H' : 2.2,
		'Met_D' : 1.2,
	};

	function pad(len, str) {
		return Array(len + 1 - str.length).join(' ') + str;
	}

	Atom = function(id, coord, ad) {
		this.id = id;
		vec3.set(coord, this);
		this.ad = ad;
		this.xs = AD2XS[ad];
		this.isHydrogen = function() {
			return (this.ad === 'H ') || (this.ad === 'HD');
		}
		this.isCarbon = function() {
			return (this.ad === 'C ') || (this.ad === 'A ');
		}
		this.isHBD = function() {
			return (this.ad === 'HD') || (this.xs === 'Met_D');
		}
		this.isHBA = function() {
			return (this.ad === 'NA') || (this.ad === 'OA') || (this.ad === 'SA');
		}
		this.donorize = function() {
			switch (this.xs) {
				case 'N_P' : this.xs = 'N_D';  break;
				case 'N_A' : this.xs = 'N_DA'; break;
				case 'O_A' : this.xs = 'O_DA'; break;
			}
		}
		this.isNeighbor = function(a) {
			var c = COVALENT[this.ad] + COVALENT[a.ad];
			return (vec3.squaredLength(vec3.subtract(this, a, [])) < c * c);
		}
		this.toPDBQT = function(center) {
			var c = vec3.add(this, center, []);
			return 'ATOM  ' + this.serial + ' ' + this.name + pad(14, '') + pad(8, c[0].toFixed(3)) + pad(8, c[1].toFixed(3)) + pad(8, c[2].toFixed(3)) + pad(16, '') + pad(6, this.e.toFixed(3)) + ' ' + this.ad;
		}
		this.render = function(gl, COLOR) {
			var e = COLOR[this.ad];
			gl.uniform3f(gl.dUL, e.r, e.g, e.b);
			gl.setModelViewMatrix(mat4.scale(mat4.translate(gl.modelViewMatrix, this, []), [0.3, 0.3, 0.3], []));
			gl.drawElements(gl.TRIANGLES, gl.sphere.vertexIndexBuffer.size, gl.UNSIGNED_SHORT, 0);
		};
	};

	Bond = function(a1, a2) {
		this.a1 = a1;
		this.a2 = a2;
		this.render = function(gl, COLOR) {
			var y = [0, 1, 0];
			var a1m = vec3.scale(vec3.subtract(this.a2, this.a1, []), 0.5, []);
			var ang = Math.acos(vec3.dot(y, a1m) / vec3.length(a1m));
			var axis = vec3.cross(y, a1m, []);
			var scale = [0.3, vec3.dist(this.a1, this.a2) * 0.5, 0.3];
			// Draw the a1 half.
			var e1 = COLOR[this.a1.ad];
			gl.uniform3f(gl.dUL, e1.r, e1.g, e1.b);
			gl.setModelViewMatrix(mat4.scale(mat4.rotate(mat4.translate(gl.modelViewMatrix, this.a1, []), ang, axis, []), scale, []));
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinder.vertexPositionBuffer.size);
			// Draw the a2 half.
			var e2 = COLOR[this.a2.ad];
			gl.uniform3f(gl.dUL, e2.r, e2.g, e2.b);
			gl.setModelViewMatrix(mat4.scale(mat4.rotate(mat4.translate(gl.modelViewMatrix, this.a2, []), ang + Math.PI, axis, []), scale, []));
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinder.vertexPositionBuffer.size);
		};
	};

	HBond = function(a1, a2) {
		this.a1 = a1;
		this.a2 = a2;
		this.render = function(gl) {
			var y = [0, 1, 0];
			var a1a2 = vec3.subtract(this.a2, this.a1, []);
			var ang = Math.acos(vec3.dot(y, a1a2) / vec3.length(a1a2));
			var axis = vec3.cross(y, a1a2, []);
			gl.setModelViewMatrix(mat4.scale(mat4.rotate(mat4.translate(gl.modelViewMatrix, this.a1, []), ang, axis, []), [0.05, vec3.dist(this.a1, this.a2), 0.05], []));
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinder.vertexPositionBuffer.size);
		};
	};

	Molecule = function() {
		this.atoms = [];
		this.bonds = [];
		this.hbds = [];
		this.hbas = [];
	};
	Molecule.prototype.renderAtoms = function(gl) {
		for (var i = 0, ii = this.atoms.length; i < ii; ++i) {
			var a = this.atoms[i];
			if (a.hidden) continue;
			a.render(gl, this.COLOR);
		}
	};
	Molecule.prototype.renderBonds = function(gl) {
		for (var i = 0, ii = this.bonds.length; i < ii; ++i) {
			var b = this.bonds[i];
			if (b.a1.hidden || b.a2.hidden) continue;
			b.render(gl, this.COLOR);
		}
	};
	Molecule.prototype.centerize = function(center) {
		for (var i = 0, ii = this.atoms.length; i < ii; ++i) {
			var a = this.atoms[i];
			vec3.subtract(a, center);
			if (a.hidden) continue;
			if (a.isHBD()) this.hbds.push(a);
			else if (a.isHBA()) this.hbas.push(a);
		}
	};

	function Color(color) {
		this.r = parseInt(color.substring(1, 3), 16) / 255.0;
		this.g = parseInt(color.substring(3, 5), 16) / 255.0;
		this.b = parseInt(color.substring(5, 7), 16) / 255.0;
	}

	function score(xs1, xs2, r) {
		if (r > 8) return 0;
		var d = r - (VDW[xs1] + VDW[xs2]);
		return (-0.035579) * Math.exp(-4 * d * d)
			+  (-0.005156) * Math.exp(-0.25 * (d - 3.0) * (d - 3.0))
			+  ( 0.840245) * (d > 0 ? 0.0 : d * d)
			+  (-0.035069) * (isHydrophobic(xs1) && isHydrophobic(xs2) ? d >= 1.5 ? 0.0 : d <= 0.5 ? 1.0 : 1.5 - d : 0.0)
			+  (-0.587439) * ((isHBdonor(xs1) && isHBacceptor(xs2)) || (isHBdonor(xs2) && isHBacceptor(xs1)) ? d >= 0 ? 0.0 : d <= -0.7 ? 1 : -1.428571 * d: 0.0);
		function isHydrophobic(xs) {
			return (xs === 'C_H') || (xs === 'F_H') || (xs === 'Cl_H') || (xs === 'Br_H') || (xs === 'I_H');
		}
		function isHBdonor(xs) {
			return (xs === 'N_D') || (xs === 'N_DA') || (xs === 'O_DA') || (xs === 'Met_D');
		}
		function isHBacceptor(xs) {
			return (xs === 'N_A') || (xs === 'N_DA') || (xs === 'O_A') || (xs === 'O_DA');
		}
	}

	Receptor = function(content, hideNonPolarHydrogens, corner1, corner2) {
		this.COLOR = {
			'H ': new Color('#FFFFFF'),
			'HD': new Color('#FFFFFF'),
			'C ': new Color('#909090'),
			'A ': new Color('#909090'),
			'N ': new Color('#3050F8'),
			'NA': new Color('#3050F8'),
			'OA': new Color('#FF0D0D'),
			'S ': new Color('#FFFF30'),
			'SA': new Color('#FFFF30'),
			'Se': new Color('#FFA100'),
			'P ': new Color('#FF8000'),
			'F ': new Color('#90E050'),
			'Cl': new Color('#1FF01F'),
			'Br': new Color('#A62929'),
			'I ': new Color('#940094'),
			'Zn': new Color('#7D80B0'),
			'Fe': new Color('#E06633'),
			'Mg': new Color('#8AFF00'),
			'Ca': new Color('#3DFF00'),
			'Mn': new Color('#9C7AC7'),
			'Cu': new Color('#C88033'),
			'Na': new Color('#AB5CF2'),
			'K ': new Color('#8F40D4'),
			'Hg': new Color('#B8B8D0'),
			'Ni': new Color('#50D050'),
			'Co': new Color('#F090A0'),
			'Cd': new Color('#FFD98F'),
			'As': new Color('#BD80E3'),
			'Sr': new Color('#00FF00'),
		};
		var residues = [];
		for (var residue = 'XXXX', lines = content.split('\n'), kk = lines.length, k = 0; k < kk; ++k) {
			var line = lines[k];
			if (line.match('^ATOM|HETATM')) {
				if (!((line[25] === residue[3]) && (line[24] === residue[2]) && (line[23] === residue[1]) && (line[22] === residue[0]))) {
					residue = line.substring(22, 26);
					residues.push(this.atoms.length);
				}
				var a = new Atom(line[21] + ':' + line.substring(17, 20) + $.trim(line.substring(22, 26)) + ':' + $.trim(line.substring(12, 16)), [parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54))], line.substring(77, 79));
				if (a.ad === 'H ') {
					if (hideNonPolarHydrogens) continue;
				} else if (a.ad === 'HD') {
					for (var i = this.atoms.length, residue_start = residues[residues.length - 1]; i > residue_start;) {
						var b = this.atoms[--i];
						if (b.isNeighbor(a)) {
							b.donorize();
							break;
						}
					}
				} else if (a.isCarbon()) {
					for (var i = this.atoms.length, residue_start = residues[residues.length - 1]; i > residue_start;) {
						var b = this.atoms[--i];
						if (!b.isCarbon() && b.isNeighbor(a)) {
							a.xs = 'C_P';
							break;
						}
					}
				} else {
					for (var i = this.atoms.length, residue_start = residues[residues.length - 1]; i > residue_start;) {
						var b = this.atoms[--i];
						if (b.isCarbon() && b.isNeighbor(a)) {
							b.xs = 'C_P';
						}
					}
				}
				this.atoms.push(a);
			} else if (line.match('^TER')) {
				residue = 'XXXX';
			}
		}
		residues.push(this.atoms.length);
		for (var r = 0, rr = residues.length - 1; r < rr; ++r) {
			var hidden = true;
			for (var i = residues[r], ii = residues[r + 1]; i < ii; ++i) {
				var a = this.atoms[i];
				if ((corner1[0] <= a[0]) && (a[0] < corner2[0]) && (corner1[1] <= a[1]) && (a[1] < corner2[1]) && (corner1[2] <= a[2]) && (a[2] < corner2[2])) {
					hidden = false;
					break;
				}
			}
			for (var i = residues[r], ii = residues[r + 1]; i < ii; ++i) {
				var a1 = this.atoms[i];
				if (hidden) {
					a1.hidden = true;
					continue;
				}
				for (var j = i + 1; j < ii; ++j) {
					var a2 = this.atoms[j];
					if (a2.isNeighbor(a1)) {
						this.bonds.push(new Bond(a1, a2));
					}
				}
			}
		}
	};
	Receptor.prototype = new Molecule();
	Receptor.prototype.score = function(xs, coord) {
		var e = 0;
		for (var i = 0, ii = this.atoms.length; i < ii; ++i) {
			var a = this.atoms[i];
			if (a.isHydrogen()) continue;
			e += score(xs, a.xs, vec3.dist(a, coord));
		}
		return e;
	}

	Ligand = function(content, hideNonPolarHydrogens) {
		this.COLOR = {
			'H ': new Color('#E6E6E6'),
			'HD': new Color('#E6E6E6'),
			'C ': new Color('#33FF33'),
			'A ': new Color('#33FF33'),
			'N ': new Color('#3333FF'),
			'NA': new Color('#3333FF'),
			'OA': new Color('#FF4D4D'),
			'S ': new Color('#E6C640'),
			'SA': new Color('#E6C640'),
			'Se': new Color('#FFA100'),
			'P ': new Color('#FF8000'),
			'F ': new Color('#B3FFFF'),
			'Cl': new Color('#1FF01F'),
			'Br': new Color('#A62929'),
			'I ': new Color('#940094'),
		};
		this.WEIGHT = {
			'HD':   1.008,
			'H ':   1.008,
			'C ':  12.01,
			'A ':  12.01,
			'N ':  14.01,
			'NA':  14.01,
			'OA':  16.00,
			'SA':  32.07,
			'S ':  32.07,
			'Se':  78.96,
			'P ':  30.97,
			'F ':  19.00,
			'Cl':  35.45,
			'Br':  79.90,
			'I ': 126.90,
		};
		var current = {
			begin: 0,
			branches: []
		};
		this.frames = [current];
		this.nHeavyAtoms = this.nActiveTors = this.mwt = 0;
		var serials = [];
		for (var lines = content.split('\n'), kk = lines.length, k = 0; k < kk; ++k) {
			var line = lines[k];
			if (line.match('^ATOM|HETATM')) {
				var a = new Atom($.trim(line.substring(12, 16)), [parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54))], line.substring(77, 79));
				a.serial = line.substring(6, 11);
				a.name = line.substring(12, 16);
				this.mwt += this.WEIGHT[a.ad];
				if (a.ad === 'H ') {
					if (hideNonPolarHydrogens) {
						a.hidden = true;
					}
					a.e = 0;
				} else if (a.ad === 'HD') {
					for (var i = this.atoms.length, frame_begin = this.frames[this.frames.length - 1]; i > frame_begin;) {
						var b = this.atoms[--i];
						if (b.isNeighbor(a)) {
							b.donorize();
							break;
						}
					}
					a.e = 0;
				} else if (a.isCarbon()) {
					for (var i = this.atoms.length, frame_begin = this.frames[this.frames.length - 1]; i > frame_begin;)
					{
						var b = this.atoms[--i];
						if (!b.isCarbon() && b.isNeighbor(a)) {
							a.xs = 'C_P';
							break;
						}
					}
					serials[parseInt(a.serial)] = a;
					++this.nHeavyAtoms;
				} else {
					for (var i = this.atoms.length, frame_begin = this.frames[this.frames.length - 1]; i > frame_begin;) {
						var b = this.atoms[--i];
						if (b.isCarbon() && b.isNeighbor(a)) {
							b.xs = 'C_P';
						}
					}
					serials[parseInt(a.serial)] = a;
					++this.nHeavyAtoms;
				}
				this.atoms.push(a);
			} else if (line.match('^BRANCH')) {
				this.frames[this.frames.length - 1].end = this.atoms.length;
				this.frames.push({
					parent: current,
					begin: this.atoms.length,
					rotorX: serials[parseInt(line.substring(6, 10))],
					branches: []
				});
				current.branches.push(this.frames[this.frames.length - 1]);
				current = this.frames[this.frames.length - 1];
			} else if (line.match('^ENDBRANCH')) {
				current.rotorY = serials[(parseInt(line.substring(13, 17)))];
				this.bonds.push(new Bond(current.rotorX, current.rotorY));
				if (!current.rotorY.isCarbon() && current.rotorX.isCarbon()) current.rotorX.xs = 'C_P';
				if (!current.rotorX.isCarbon() && current.rotorY.isCarbon()) current.rotorY.xs = 'C_P';
				if (current === this.frames[this.frames.length - 1]) {
					var nHeavyAtoms = 0;
					for (var i = this.atoms.length; i > current.begin;) {
						if (!this.atoms[--i].isHydrogen()) ++nHeavyAtoms;
					}
					current.inactive = nHeavyAtoms === 1;
				}
				if (!current.inactive) ++this.nActiveTors;
				current = current.parent;
			} else if (line.match('^TORSDOF')) break;
		}
		this.flexPenalty = 1 + 0.05846 * (this.nActiveTors + 0.5 * (this.frames.length - 1 - this.nActiveTors));
		this.frames[this.frames.length - 1].end = this.atoms.length;
		this.frames[0].rotorY = this.atoms[0];
		for (var f = 0, ff = this.frames.length - 1; f < ff; ++f) {
			for (var i = this.frames[f].begin, ii = this.frames[f].end; i < ii; ++i) {
				var a1 = this.atoms[i];
				for (var j = i + 1; j < ii; ++j) {
					var a2 = this.atoms[j];
					if (a2.isNeighbor(a1)) {
						this.bonds.push(new Bond(a1, a2));
					}
				}
			}
		}
		this.interactingPairs = [];
		var nBonds = this.bonds.length, neighbors = [];
		for (var k1 = 0; k1 < this.frames.length; ++k1) {
			var f1 = this.frames[k1];
			for (var i = f1.begin; i < f1.end; ++i) {
				var a1 = this.atoms[i];
				if (a1.isHydrogen()) continue;
				neighbors.push(a1);
				for (var bi1 = 0; bi1 < nBonds; ++bi1) {
					var b1 = this.bonds[bi1];
					if (!(b1.a1 === a1 || b1.a2 === a1)) continue;
					var n1 = b1.a1 === a1 ? b1.a2 : b1.a1;
					if (n1.isHydrogen()) continue;
					if ($.inArray(n1, neighbors) === -1) {
						neighbors.push(n1);
					}
					for (var bi2 = 0; bi2 < nBonds; ++bi2) {
						var b2 = this.bonds[bi2];
						if (!(b2.a1 === n1 || b2.a2 === n1)) continue;
						var n2 = b2.a1 === n1 ? b2.a2 : b2.a1;
						if (n2.isHydrogen()) continue;
						if ($.inArray(n2, neighbors) === -1) {
							neighbors.push(n2);
						}
						for (var bi3 = 0; bi3 < nBonds; ++bi3) {
							var b3 = this.bonds[bi3];
							if (!(b3.a1 === n2 || b3.a2 === n2)) continue;
							var n3 = b3.a1 === n2 ? b3.a2 : b3.a1;
							if (n3.isHydrogen()) continue;
							if ($.inArray(n3, neighbors) === -1) {
								neighbors.push(n3);
							}
						}
					}
				}
				for (var k2 = k1 + 1; k2 < this.frames.length; ++k2) {
					var f2 = this.frames[k2];
					for (var j = f2.begin; j < f2.end; ++j) {
						var a2 = this.atoms[j];
						if (a2.isHydrogen()) continue;
						if ((f1 === f2.parent && (a2 === f2.rotorY || a1 === f2.rotorX)) || $.inArray(a2, neighbors) >= 0) continue;
						this.interactingPairs.push({
							a1: a1,
							a2: a2
						});
					}
				}				
				neighbors.length = 0;
			}
		}
	};
	Ligand.prototype = new Molecule();
	Ligand.prototype.save = function(center) {
		var lines = [
			'ROOT'
		];
		var root = this.frames[0];
		for (var i = root.begin; i < root.end; ++i) {
			lines.push(this.atoms[i].toPDBQT(center));
		}
		lines.push('ENDROOT');
		var stack = [];
		for (var i = root.branches.length; i > 0;) {
			stack.push(root.branches[--i]);
		}
		for (var i = 1, ii = this.frames.length; i < ii; ++i) {
			this.frames[i].dumped = false;
		}
		while (stack.length) {
			var f = stack[stack.length - 1];
			if (!f.dumped) {
				lines.push('BRANCH' + f.rotorX.serial.substring(1, 5) + f.rotorY.serial.substring(1, 5));
				for (var i = f.begin; i < f.end; ++i) {
					lines.push(this.atoms[i].toPDBQT(center));
				}
				f.dumped = true;
				for (var i = f.branches.length; i > 0;) {
					stack.push(f.branches[--i]);
				}
			} else {
				lines.push('ENDBRANCH' + f.rotorX.serial.substring(1, 5) + f.rotorY.serial.substring(1, 5));
				stack.pop();
			}
		}
		lines.push('TORSDOF ' + (this.frames.length - 1));
		return lines.join('\n');
	}
	Ligand.prototype.refreshE = function(receptor) {
		this.eInter = 0;
		for (var i = 0, ii = this.atoms.length; i < ii; ++i) {
			var a = this.atoms[i];
			if (a.isHydrogen()) continue;
			a.e = receptor.score(a.xs, a);
			this.eInter += a.e;
		}
		this.eIntra = 0;
		for (var i = 0, ii = this.interactingPairs.length; i < ii; ++i) {
			var p = this.interactingPairs[i];
			this.eIntra += score(p.a1.xs, p.a2.xs, vec3.dist(p.a1, p.a2));
		}
		this.eTotal = this.eInter + this.eIntra;
		this.eNormalized = this.eInter / this.flexPenalty;
		this.efficiency  = this.eInter / this.nHeavyAtoms;
	}
	Ligand.prototype.refreshC = function(pos, ori, tor, corner1, corner2) {
		var root = this.frames[0];
		vec3.set(pos, root.rotorY);
		root.ori = quat4.create(ori);
		root.rot = quat4.toMat3(root.ori, []);
		for (var i = root.begin; i < root.end; ++i) {
			var a = this.atoms[i];
			vec3.add(root.rotorY, mat3.multiplyVec3(root.rot, a.coord, []), a);
			if (!((corner1[0] <= a[0]) && (a[0] < corner2[0]) && (corner1[1] <= a[1]) && (a[1] < corner2[1]) && (corner1[2] <= a[2]) && (a[2] < corner2[2]))) return false;
		}
		for (var k = 1, t = 0; k < this.frames.length; ++k) {
			var f = this.frames[k];
			var p = f.parent;
			vec3.add(p.rotorY, mat3.multiplyVec3(p.rot, f.y2y, []), f.rotorY);
			f.axe = mat3.multiplyVec3(p.rot, f.x2y, []);
			f.ori = quat4.multiply(quat4.fromAngleAxis(f.inactive ? 0 : tor[t++], f.axe, []), p.ori, []);
			f.rot = quat4.toMat3(f.ori, []);
			for (var i = f.begin; i < f.end; ++i) {
				var a = this.atoms[i];
				vec3.add(f.rotorY, mat3.multiplyVec3(f.rot, a.coord, []), a);
				if (!((corner1[0] <= a[0]) && (a[0] < corner2[0]) && (corner1[1] <= a[1]) && (a[1] < corner2[1]) && (corner1[2] <= a[2]) && (a[2] < corner2[2]))) return false;
			}
		}
		return true;
	}
	Ligand.prototype.refreshD = function(receptor) {
		var d = 0.0001;
		for (var i = 0; i < this.atoms.length; ++i) {
			var a = this.atoms[i];
			if (a.isHydrogen()) continue;
			var e100 = receptor.score(a.xs, vec3.add(a, [d, 0, 0], []));
			var e010 = receptor.score(a.xs, vec3.add(a, [0, d, 0], []));
			var e001 = receptor.score(a.xs, vec3.add(a, [0, 0, d], []));
			a.d = vec3.subtract([e100, e010, e001], [a.e, a.e, a.e], []);
			vec3.scale(a.d, 1 / d);
		}
		for (var i = 0; i < this.interactingPairs.length; ++i) {
			var p = this.interactingPairs[i];
			var v = vec3.subtract(p.a2, p.a1, []);
			var r = vec3.length(v);
			vec3.scale(v, (score(p.a1.xs, p.a2.xs, r + d) - score(p.a1.xs, p.a2.xs, r)) / (r * d));
			vec3.subtract(p.a1.d, v);
			vec3.add(p.a2.d, v);
		}
	}
	Ligand.prototype.refreshG = function() {
		for (var k = 0; k < this.frames.length; ++k) {
			var f = this.frames[k];
			f.force  = vec3.create();
			f.torque = vec3.create();
		}
		this.g = new Array(6 + this.nActiveTors);
		for (var k = this.frames.length - 1, t = this.nActiveTors; k > 0; --k) {
			var f = this.frames[k];
			for (var i = f.begin; i < f.end; ++i) {
				var a = this.atoms[i];
				if (a.isHydrogen()) continue;
				vec3.add(f.force, a.d);
				vec3.add(f.torque, vec3.cross(vec3.subtract(a, f.rotorY, []), a.d, []));
			}
			var p = f.parent;
			vec3.add(p.force, f.force);
			vec3.add(p.torque, vec3.add(f.torque, vec3.cross(vec3.subtract(f.rotorY, p.rotorY, []), f.force, []), []));
			if (f.inactive) continue;
			this.g[6 + (--t)] = vec3.dot(f.torque, f.axe);
		}
		var root = this.frames[0];
		for (var f = root, i = f.begin; i < f.end; ++i) {
			var a = this.atoms[i];
			if (a.isHydrogen()) continue;
			vec3.add(f.force, a.d);
			vec3.add(f.torque, vec3.cross(vec3.subtract(a, f.rotorY, []), a.d, []));
		}
		this.g[0] = root.force[0];
		this.g[1] = root.force[1];
		this.g[2] = root.force[2];
		this.g[3] = root.torque[0];
		this.g[4] = root.torque[1];
		this.g[5] = root.torque[2];
	}
	Ligand.prototype.refreshR = function() {
		for (var k = 0; k < this.frames.length; ++k) {
			var f = this.frames[k];
			for (var i = f.begin; i < f.end; ++i) {
				var a = this.atoms[i];
				a.coord = vec3.subtract(a, f.rotorY, []);
			}
		}
		for (var k = 1; k < this.frames.length; ++k) {
			var f = this.frames[k];
			f.y2y = vec3.subtract(f.rotorY, f.parent.rotorY, []);
			f.axe = f.x2y = vec3.normalize(vec3.subtract(f.rotorY, f.rotorX, []), []);
		}
	}

	Mesh = function() {
	};
	Mesh.prototype.createBuffers = function(gl, positionData, normalData, indexData) {
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
		this.vertexPositionBuffer.size = positionData.length / 3;

		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
		this.vertexNormalBuffer.size = normalData.length / 3;
			
		if (indexData) {
			this.vertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
			this.vertexIndexBuffer.size = indexData.length;
		}
	};
	Mesh.prototype.bindBuffers = function(gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(gl.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.vertexAttribPointer(gl.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
		if (this.vertexIndexBuffer) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		}
	};

	Sphere = function(gl, bands) {
		var positionData = [];
		var normalData = [];
		var latitudeAngle = Math.PI / bands;
		var longitudeAngle = 2 * latitudeAngle;
		for (var latNumber = 0; latNumber <= bands; ++latNumber) {
			var theta = latitudeAngle * latNumber;
			var sinTheta = Math.sin(theta);
			var y = Math.cos(theta);
			for (var longNumber = 0; longNumber <= bands; ++longNumber) {
				var phi = longitudeAngle * longNumber;
				var x = Math.cos(phi) * sinTheta;
				var z = Math.sin(phi) * sinTheta;
				normalData.push(x, y, z);
				positionData.push(x, y, z);
			}
		}
		var indexData = [];
		for (var latNumber = 0; latNumber < bands; ++latNumber) {
			var offset = latNumber * (bands + 1);
			for (var longNumber = 0; longNumber <= bands; ++longNumber) {
				var first = offset + longNumber;
				var second = first + (bands + 1);
				indexData.push(first, second, first + 1);
				if (longNumber < bands) {
					indexData.push(second, second + 1, first + 1);
				}
			}
		}
		this.createBuffers(gl, positionData, normalData, indexData);
	};
	Sphere.prototype = new Mesh();

	Cylinder = function(gl, bands) {
		var positionData = [];
		var normalData = [];
		var angle = 2 * Math.PI / bands;
		for (var i = 0; i <= bands; ++i) {
			var theta = angle * i;
			var cosTheta = Math.cos(theta);
			var sinTheta = Math.sin(theta);
			normalData.push(cosTheta, 0, sinTheta);
			positionData.push(cosTheta, 0, sinTheta);
			normalData.push(cosTheta, 0, sinTheta);
			positionData.push(cosTheta, 1, sinTheta);
		}
		this.createBuffers(gl, positionData, normalData);
	};
	Cylinder.prototype = new Mesh();

	var unitRadius = Math.PI / 180.0;
	var CTRL = false;
	var keydownup = function(e) {
		CTRL = e.ctrlKey;
	};
	$(document).keydown(keydownup).keyup(keydownup);

	var iview = function(options) {
		this.options = $.extend({
			hideNonPolarHydrogens: true
		}, options);
		this.canvas = $('#' + this.options.id);
		var gl = this.canvas.get(0).getContext('experimental-webgl', {
			preserveDrawingBuffer: true
		});
		this.disabled = !gl;
		if (this.disabled) return;
		gl.enable(gl.DEPTH_TEST);
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, [
			'attribute vec3 a_vertex_position;',
			'attribute vec3 a_vertex_normal;',
			'uniform vec3 u_diffuse_color;',
			'uniform mat4 u_projection_matrix;',
			'uniform mat4 u_model_view_matrix;',
			'uniform mat3 u_normal_matrix;',
			'varying vec3 v_normal;',
			'varying vec3 v_diffuse;',
			'void main() {',
				'v_normal = normalize(u_normal_matrix * a_vertex_normal);',
				'v_diffuse = u_diffuse_color;',
				'gl_Position = u_projection_matrix * u_model_view_matrix * vec4(a_vertex_position, 1.0);',
			'}'
		].join(''));
		gl.compileShader(vertexShader);
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, [
			'precision mediump float;',
			'varying vec3 v_normal;',
			'varying vec3 v_diffuse;',
			'void main() {',
				'float d = max(dot(v_normal, vec3(0.1, 0.1, 1)), 0.0);',
				'gl_FragColor = vec4(v_diffuse * d + vec3(0.3, 0.3, 0.3) * pow(d, 32.0), 1.0);',
			'}'
		].join(''));
		gl.compileShader(fragmentShader);
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.useProgram(program);
		gl.vertexPositionAttribute = gl.getAttribLocation(program, 'a_vertex_position');
		gl.vertexNormalAttribute = gl.getAttribLocation(program, 'a_vertex_normal');
		gl.enableVertexAttribArray(gl.vertexPositionAttribute);
		gl.enableVertexAttribArray(gl.vertexNormalAttribute);
		gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_projection_matrix'), false, mat4.perspective(45, this.canvas.attr('width') / this.canvas.attr('height'), 0.1, 1000));
		gl.dUL = gl.getUniformLocation(program, 'u_diffuse_color');
		gl.mvUL = gl.getUniformLocation(program, 'u_model_view_matrix');
		gl.nUL = gl.getUniformLocation(program, 'u_normal_matrix');
		gl.setModelViewMatrix = function(mvMatrix) {
			this.uniformMatrix4fv(this.mvUL, false, mvMatrix);
			this.uniformMatrix3fv(this.nUL, false, mat3.transpose(mat4.toInverseMat3(mvMatrix, []), []));
		};
		gl.sphere = new Sphere(gl, 60);
		gl.cylinder = new Cylinder(gl, 60);
		this.gl = gl;
		var iv = this;
		this.mousebuttons = [];
		this.canvas.bind("contextmenu", function() {
			return false;
		});
		this.canvas.mousedown(function(e) {
			iv.ismousedown = true;
			iv.mousebuttons[e.which] = true;
			iv.pageX = e.pageX;
			iv.pageY = e.pageY;
		});
		this.canvas.mouseup(function(e) {
			iv.ismousedown = false;
			iv.mousebuttons[e.which] = false;
		});
		this.canvas.mousemove(function(e) {
			if (!iv.ismousedown) return;
			var dx = e.pageX - iv.pageX;
			var dy = e.pageY - iv.pageY;
			iv.pageX = e.pageX;
			iv.pageY = e.pageY;
			if (CTRL) {
				if (iv.mousebuttons[1] && !iv.mousebuttons[3]) {
					var rotation = mat4.rotate(mat4.rotate(mat4.identity(), dx * unitRadius, [0, 1, 0]), dy * unitRadius, [1, 0, 0], []);
					for (var i = 0, ii = iv.ligand.atoms.length; i < ii; ++i) {
						mat4.multiplyVec3(rotation, iv.ligand.atoms[i]);
					}
					iv.ligand.refreshE(iv.receptor);
					iv.refreshH();
					if (iv.options.refresh) iv.options.refresh();
				} else if (iv.mousebuttons[3] && !iv.mousebuttons[1]) {
					var translation = mat3.multiply(mat4.toInverseMat3(iv.gl.modelViewMatrix, []),  [dx * 0.05, -dy * 0.05, 0], []);
					for (var i = 0, ii = iv.ligand.atoms.length; i < ii; ++i) {
						vec3.add(iv.ligand.atoms[i], translation);
					}
					iv.ligand.refreshE(iv.receptor);
					iv.refreshH();
					if (iv.options.refresh) iv.options.refresh();
				}
			} else {
				if (iv.mousebuttons[1] && !iv.mousebuttons[3]) {
					mat4.multiply(mat4.rotate(mat4.rotate(mat4.identity(), dx * unitRadius, [0, 1, 0]), dy * unitRadius, [1, 0, 0], []), iv.rotationMatrix, iv.rotationMatrix);
				} else if (iv.mousebuttons[3] && !iv.mousebuttons[1]) {
					mat4.translate(iv.translationMatrix, [dx * 0.05, -dy * 0.05, 0]);
				}
			}
			iv.repaint();
		});
		this.canvas.mousewheel(function(e, delta) {
			e.preventDefault();
			mat4.translate(iv.translationMatrix, [0, 0, delta * 2.5]);
			iv.repaint();
		});
		this.idock = new Worker('idock.js');
		this.idock.onmessage = function(e) {
			iv.ligand.refreshR();
			iv.ligand.refreshD(iv.receptor);
			iv.ligand.refreshC(e.data.pos, e.data.ori, e.data.tor, iv.corner1, iv.corner2)
			iv.ligand.refreshE(iv.receptor);
			iv.refreshH();
			iv.repaint();
			if (iv.options.refresh) iv.options.refresh();
		};
	};
	iview.prototype.setBox = function(center, size) {
		this.center = center;
		this.size = size;
		var half = vec3.scale(size, 0.5, []);
		this.corner1 = vec3.subtract(center, half, []);
		this.corner2 = vec3.add(center, half, []);
		this.translationMatrix = mat4.translate(mat4.identity(), [0, 0, -20]);
		this.rotationMatrix = mat4.identity();
	}
	iview.prototype.parseReceptor = function(content) {
		this.receptor = new Receptor(content, this.options.hideNonPolarHydrogens, this.corner1, this.corner2);
		this.receptor.centerize(this.center);
	}
	iview.prototype.parseLigand = function(content) {
		this.ligand = new Ligand(content, this.options.hideNonPolarHydrogens);
		this.ligand.centerize(this.center);
		vec3.subtract(this.corner1, this.center);
		vec3.subtract(this.corner2, this.center);
		this.ligand.refreshE(this.receptor);
		this.refreshH();
		if (this.options.refresh) this.options.refresh();
	}
	iview.prototype.refreshH = function() {
		this.hbonds = [];
		for (var i = 0, ii = this.receptor.hbds.length; i < ii; ++i) {
			var r = this.receptor.hbds[i];
			for (var j = 0, jj = this.ligand.hbas.length; j < jj; ++j) {
				var l = this.ligand.hbas[j];
				if (vec3.dist(r, l) < 3.5) {
					this.hbonds.push(new HBond(r, l));
				}
			}
		}
		for (var i = 0, ii = this.receptor.hbas.length; i < ii; ++i) {
			var r = this.receptor.hbas[i];
			for (var j = 0, jj = this.ligand.hbds.length; j < jj; ++j) {
				var l = this.ligand.hbds[j];
				if (vec3.dist(r, l) < 3.5) {
					this.hbonds.push(new HBond(r, l));
				}
			}
		}
	};
	iview.prototype.repaint = function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.modelViewMatrix = mat4.multiply(this.translationMatrix, this.rotationMatrix, []);
		// Draw atoms.
		this.gl.sphere.bindBuffers(this.gl);
		this.receptor.renderAtoms(this.gl);
		this.ligand.renderAtoms(this.gl);
		// Draw covalent bonds.
		this.gl.cylinder.bindBuffers(this.gl);
		this.receptor.renderBonds(this.gl);
		this.ligand.renderBonds(this.gl);
		// Draw hydrogen bonds.
		this.gl.uniform3f(this.gl.dUL, 0.2, 1.0, 0.2);
		for (var i = 0, ii = this.hbonds.length; i < ii; ++i) {
			this.hbonds[i].render(this.gl);
		}
	};
	iview.prototype.dock = function() {
		this.idock.postMessage(/*JSON.stringify(this.ligand)*/);
		return;
		this.ligand.refreshR();
		this.ligand.refreshD(this.receptor);
		this.ligand.refreshG();
		var eTotal = this.ligand.eTotal;
		var g = this.ligand.g;
		function index(i, j) {
			return i + j * (j + 1) >> 1;
		}
		var n = 6 + this.ligand.nActiveTors;
		var identityHessian = new Array(n*(n+1) >> 1);
		for (var i = 0, ii = identityHessian.length; i < ii; ++i) {
			identityHessian[i] = 0;
		}
		for (var i = 0; i < n; ++i) {
			identityHessian[index(i, i)] = 1;
		}
		var h = identityHessian.slice(0);
		var pos1 = vec3.create(this.ligand.frames[0].rotorY), ori1 = quat4.identity(), tor1 = new Array(this.ligand.nActiveTors);
		for (var i = 0; i < this.ligand.nActiveTors; ++i) {
			tor1[i] = 0;
		}
		var pos2 = vec3.create(), ori2 = quat4.create(), tor2 = new Array(this.ligand.nActiveTors);
		var mc = 0;
		while (true) {
			var p = new Array(n);
			for (var i = 0; i < n; ++i) {
				var sum = 0;
				for (var j = 0; j < n; ++j) {
					sum += h[i < j ? index(i, j) : index(j, i)] * g[j];
				}
				p[i] = -sum;
			}
			var pg = 0;
			for (var i = 0; i < n; ++i) {
				pg += p[i] * g[i];
			}
			pg *= 0.0001;
			var t;
			for (t = 0, alpha = 1; t < 20; ++t, alpha *= 0.5) {
				vec3.add(pos1, vec3.scale(p, alpha, []), pos2);
				var rot = vec3.scale(p.slice(3, 6), alpha, []);
				quat4.multiply(quat4.fromAngleAxis(vec3.length(rot), vec3.normalize(rot), []), ori1, ori2);
				for (var i = 0; i < this.ligand.nActiveTors; ++i) {
					tor2[i] = tor1[i] + alpha * p[6 + i];
				}
				if (!this.ligand.refreshC(pos2, ori2, tor2, this.corner1, this.corner2)) continue;
				this.ligand.refreshE(this.receptor);
				if (this.ligand.eTotal < eTotal + alpha * pg) break;
			}
			if (t === 20) {
				if (mc === 0) {
					this.ligand.refreshC(pos1, ori1, tor1, this.corner1, this.corner2);
					this.ligand.refreshE(this.receptor);
					break;
				}
				h = identityHessian.slice(0);
				mc = 0;
				continue;
			}
			this.ligand.refreshD(this.receptor);
			this.ligand.refreshG();
			var y = new Array(n);
			for (var i = 0; i < n; ++i) {
				y[i] = this.ligand.g[i] - g[i];
			}
			var mhy = new Array(n);
			for (var i = 0; i < n; ++i) {
				var sum = 0;
				for (var j = 0; j < n; ++j) {
					sum += h[i < j ? index(i, j) : index(j, i)] * y[j];
				}
				mhy[i] = -sum;
			}
			var yhy = 0;
			for (var i = 0; i < n; ++i) {
				yhy -= y[i] * mhy[i];
			}
			var yp = 0;
			for (var i = 0; i < n; ++i) {
				yp += y[i] * p[i];
			}
			var ryp = 1 / yp;
			var pco = ryp * (ryp * yhy + alpha);
			for (var i = 0; i < n; ++i)
			for (var j = i; j < n; ++j) {
				h[index(i, j)] += ryp * (mhy[i] * p[j] + mhy[j] * p[i]) + pco * p[i] * p[j];
			}
			vec3.set(pos2, pos1);
			quat4.set(ori2, ori1);
			for (var i = 0; i < this.ligand.nActiveTors; ++i) {
				tor1[i] = tor2[i];
			}
			eTotal = this.ligand.eTotal;
			g = this.ligand.g;
			this.refreshH();
			this.repaint();
			if (this.options.refresh) this.options.refresh();
			++mc;
		}
	}
	iview.prototype.save = function() {
		return this.ligand.save(this.center);
	}
	iview.prototype.export = function() {
		window.open(this.canvas.get(0).toDataURL('image/png'));
	};

	return iview;

})();
