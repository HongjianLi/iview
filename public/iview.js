/*
	Copyright (c) 2012, The Chinese University of Hong Kong

	This program is free software: you can redistribute it and/or modify
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

	var iview = {};

	iview.stringStartsWith = function(str, match) {
		return str.match('^' + match) == match;
	};

	iview.vec3AngleFrom = function(v1, v2) {
		var length1 = vec3.length(v1);
		var length2 = vec3.length(v2);
		var dot = vec3.dot(v1, v2);
		var cosine = dot / length1 / length2;
		return Math.acos(cosine);
	};

	iview.contextHashTo = function(ctx, xs, ys, xt, yt, width, spacing) {
		var travelled = 0;
		var space = false;
		var lastX = xs;
		var lastY = ys;
		var difX = xt - xs;
		var difY = yt - ys;
		var dist = Math.sqrt(difX*difX+difY*difY);
		while (travelled < dist) {
			if (space) {
				if (travelled + spacing > dist) {
					ctx.moveTo(xt, yt);
					break;
				} else {
					var percent = spacing / dist;
					lastX += percent * difX;
					lastY += percent * difY;
					ctx.moveTo(lastX, lastY);
					travelled += spacing;
				}
			} else {
				if (travelled + width > dist) {
					ctx.lineTo(xt, yt);
					break;
				} else {
					var percent = width / dist;
					lastX += percent * difX;
					lastY += percent * difY;
					ctx.lineTo(lastX, lastY);
					travelled += width;
				}
			}
			space = !space;
		}
	};

	iview.isBetween = function(x, left, right) {
		return x >= left && x <= right;
	};

	iview.getRGB = function(color) {
		return [ parseInt(color.substring(1, 3), 16) / 255.0, parseInt(color.substring(3, 5), 16) / 255.0, parseInt(color.substring(5, 7), 16) / 255.0 ];
	};

	iview.calculateDistanceInterior = function(to, from, r) {
		if (this.isBetween(from.x, r.x, r.x + r.w) && this.isBetween(from.y, r.y, r.y + r.w)) {
			return to.distance(from);
		}
		// calculates the distance that a line needs to remove from itself to be
		// outside that rectangle
		var lines = [];
		// top
		lines.push({
			x1 : r.x,
			y1 : r.y,
			x2 : r.x + r.w,
			y2 : r.y
		});
		// bottom
		lines.push({
			x1 : r.x,
			y1 : r.y + r.h,
			x2 : r.x + r.w,
			y2 : r.y + r.h
		});
		// left
		lines.push({
			x1 : r.x,
			y1 : r.y,
			x2 : r.x,
			y2 : r.y + r.h
		});
		// right
		lines.push({
			x1 : r.x + r.w,
			y1 : r.y,
			x2 : r.x + r.w,
			y2 : r.y + r.h
		});

		var intersections = [];
		for ( var i = 0; i < 4; i++) {
			var l = lines[i];
			var p = this.intersectLines(from.x, from.y, to.x, to.y, l.x1, l.y1, l.x2, l.y2);
			if (p) {
				intersections.push(p);
			}
		}
		if (intersections.length == 0) {
			return 0;
		}
		var max = 0;
		for ( var i = 0, ii = intersections.length; i < ii; i++) {
			var p = intersections[i];
			var dx = to.x - p.x;
			var dy = to.y - p.y;
			max = Math.max(max, Math.sqrt(dx * dx + dy * dy));
		}
		return max;
	};

	iview.intersectLines = function(ax, ay, bx, by, cx, cy, dx, dy) {
		// calculate the direction vectors
		bx -= ax;
		by -= ay;
		dx -= cx;
		dy -= cy;

		// are they parallel?
		var denominator = by * dx - bx * dy;
		if (denominator == 0)
			return false;

		// calculate point of intersection
		var r = (dy * (ax - cx) - dx * (ay - cy)) / denominator;
		var s = (by * (ax - cx) - bx * (ay - cy)) / denominator;
		if ((s >= 0) && (s <= 1) && (r >= 0) && (r <= 1))
			return {
				x : (ax + r * bx),
				y : (ay + r * by)
			};
		else
			return false;
	};

	iview.ELEMENT = (function() {

		function Element(symbol, name, atomicNumber) {
			this.symbol = symbol;
			this.name = name;
			this.atomicNumber = atomicNumber;
		}

		var E = [];
		E['H'] = new Element('H', 'Hydrogen', 1);
		E['C'] = new Element('C', 'Carbon', 6);
		E['N'] = new Element('N', 'Nitrogen', 7);
		E['O'] = new Element('O', 'Oxygen', 8);
		E['F'] = new Element('F', 'Fluorine', 9);
		E['Na'] = new Element('Na', 'Sodium', 11);
		E['Mg'] = new Element('Mg', 'Magnesium', 12);
		E['P'] = new Element('P', 'Phosphorus', 15);
		E['S'] = new Element('S', 'Sulfur', 16);
		E['Cl'] = new Element('Cl', 'Chlorine', 17);
		E['K'] = new Element('K', 'Potassium', 19);
		E['Ca'] = new Element('Ca', 'Calcium', 20);
		E['Mn'] = new Element('Mn', 'Manganese', 25);
		E['Fe'] = new Element('Fe', 'Iron', 26);
		E['Co'] = new Element('Co', 'Cobalt', 27);
		E['Ni'] = new Element('Ni', 'Nickel', 28);
		E['Cu'] = new Element('Cu', 'Copper', 29);
		E['Zn'] = new Element('Zn', 'Zinc', 30);
		E['As'] = new Element('As', 'Arsenic', 33);
		E['Se'] = new Element('Se', 'Selenium', 34);
		E['Br'] = new Element('Br', 'Bromine', 35);
		E['Sr'] = new Element('Sr', 'Strontium', 38);
		E['Cd'] = new Element('Cd', 'Cadmium', 48);
		E['I'] = new Element('I', 'Iodine', 53);
		E['Hg'] = new Element('Hg', 'Mercury', 80);

		// set up jmol colors
		E['H'].color = '#FFFFFF';
		E['C'].color = '#909090';
		E['N'].color = '#3050F8';
		E['O'].color = '#FF0D0D';
		E['F'].color = '#90E050';
		E['Na'].color = '#AB5CF2';
		E['Mg'].color = '#8AFF00';
		E['P'].color = '#FF8000';
		E['S'].color = '#FFFF30';
		E['Cl'].color = '#1FF01F';
		E['K'].color = '#8F40D4';
		E['Ca'].color = '#3DFF00';
		E['Mn'].color = '#9C7AC7';
		E['Fe'].color = '#E06633';
		E['Co'].color = '#F090A0';
		E['Ni'].color = '#50D050';
		E['Cu'].color = '#C88033';
		E['Zn'].color = '#7D80B0';
		E['As'].color = '#BD80E3';
		E['Se'].color = '#FFA100';
		E['Br'].color = '#A62929';
		E['Sr'].color = '#00FF00';
		E['Cd'].color = '#FFD98F';
		E['I'].color = '#940094';
		E['Hg'].color = '#B8B8D0';

	/* Uncomment these lines to substitute PyMOL colors
		E['H'].color = '#E6E6E6';
		E['C'].color = '#33FF33';
		E['N'].color = '#3333FF';
		E['O'].color = '#FF4D4D';
		E['F'].color = '#B3FFFF';
		E['S'].color = '#E6C640';
	*/
		// set up covalent radii
		E['H'].covalentRadius = 0.31;
		E['C'].covalentRadius = 0.76;
		E['N'].covalentRadius = 0.71;
		E['O'].covalentRadius = 0.66;
		E['F'].covalentRadius = 0.57;
		E['Na'].covalentRadius = 1.66;
		E['Mg'].covalentRadius = 1.41;
		E['P'].covalentRadius = 1.07;
		E['S'].covalentRadius = 1.05;
		E['Cl'].covalentRadius = 1.02;
		E['K'].covalentRadius = 2.03;
		E['Ca'].covalentRadius = 1.76;
		E['Mn'].covalentRadius = 1.39;
		E['Fe'].covalentRadius = 1.32;
		E['Co'].covalentRadius = 1.26;
		E['Ni'].covalentRadius = 1.24;
		E['Cu'].covalentRadius = 1.32;
		E['Zn'].covalentRadius = 1.22;
		E['As'].covalentRadius = 1.19;
		E['Se'].covalentRadius = 1.2;
		E['Br'].covalentRadius = 1.2;
		E['Sr'].covalentRadius = 1.95;
		E['Cd'].covalentRadius = 1.44;
		E['I'].covalentRadius = 1.39;
		E['Hg'].covalentRadius = 1.32;

		// set up vdW radii
		E['H'].vdWRadius = 1.2;
		E['C'].vdWRadius = 1.7;
		E['N'].vdWRadius = 1.55;
		E['O'].vdWRadius = 1.52;
		E['F'].vdWRadius = 1.47;
		E['Na'].vdWRadius = 2.27;
		E['Mg'].vdWRadius = 1.73;
		E['P'].vdWRadius = 1.8;
		E['S'].vdWRadius = 1.8;
		E['Cl'].vdWRadius = 1.75;
		E['K'].vdWRadius = 2.75;
		E['Ca'].vdWRadius = 0.0;
		E['Mn'].vdWRadius = 0.0;
		E['Fe'].vdWRadius = 0.0;
		E['Co'].vdWRadius = 0.0;
		E['Ni'].vdWRadius = 1.63;
		E['Cu'].vdWRadius = 1.4;
		E['Zn'].vdWRadius = 1.39;
		E['As'].vdWRadius = 1.85;
		E['Se'].vdWRadius = 1.9;
		E['Br'].vdWRadius = 1.85;
		E['Sr'].vdWRadius = 0.0;
		E['Cd'].vdWRadius = 1.58;
		E['I'].vdWRadius = 1.98;
		E['Hg'].vdWRadius = 1.55;

		E['H'].valency = 1;
		E['C'].valency = 4;
		E['N'].valency = 3;
		E['O'].valency = 2;
		E['F'].valency = 1;
		E['Na'].valency = 1;
		E['Mg'].valency = 0;
		E['P'].valency = 3;
		E['S'].valency = 2;
		E['Cl'].valency = 1;
		E['K'].valency = 0;
		E['Ca'].valency = 0;
		E['Mn'].valency = 3;
		E['Fe'].valency = 2;
		E['Co'].valency = 1;
		E['Ni'].valency = 1;
		E['Cu'].valency = 0;
		E['Zn'].valency = 0;
		E['As'].valency = 3;
		E['Se'].valency = 2;
		E['Br'].valency = 1;
		E['Sr'].valency = 0;
		E['Cd'].valency = 0;
		E['I'].valency = 1;
		E['Hg'].valency = 0;

		E['H'].mass = 1;
		E['C'].mass = 12;
		E['N'].mass = 14;
		E['O'].mass = 16;
		E['F'].mass = 19;
		E['Na'].mass = 23;
		E['Mg'].mass = 24;
		E['P'].mass = 31;
		E['S'].mass = 32;
		E['Cl'].mass = 35;
		E['K'].mass = 39;
		E['Ca'].mass = 40;
		E['Mn'].mass = 55;
		E['Fe'].mass = 56;
		E['Co'].mass = 59;
		E['Ni'].mass = 58;
		E['Cu'].mass = 63;
		E['Zn'].mass = 64;
		E['As'].mass = 75;
		E['Se'].mass = 80;
		E['Br'].mass = 79;
		E['Sr'].mass = 88;
		E['Cd'].mass = 114;
		E['I'].mass = 127;
		E['Hg'].mass = 202;

		return E;

	})();

	iview.Point = function(x, y) {
		this.x = x;
		this.y = y;
		this.sub = function(p) {
			this.x -= p.x;
			this.y -= p.y;
		};
		this.add = function(p) {
			this.x += p.x;
			this.y += p.y;
		};
		this.distance = function(p) {
			var dx = p.x - this.x;
			var dy = p.y - this.y;
			return Math.sqrt(dx*dx+dy*dy);
		};
		this.angleForStupidCanvasArcs = function(p) {
			var dx = p.x - this.x;
			var dy = p.y - this.y;
			var angle = 0;
			// Calculate angle
			if (dx == 0) {
				if (dy == 0) {
					angle = 0;
				} else if (dy > 0) {
					angle = Math.PI / 2;
				} else {
					angle = 3 * Math.PI / 2;
				}
			} else if (dy == 0) {
				if (dx > 0) {
					angle = 0;
				} else {
					angle = Math.PI;
				}
			} else {
				if (dx < 0) {
					angle = Math.atan(dy / dx) + Math.PI;
				} else if (dy < 0) {
					angle = Math.atan(dy / dx) + 2 * Math.PI;
				} else {
					angle = Math.atan(dy / dx);
				}
			}
			while (angle < 0) {
				angle += Math.PI * 2;
			}
			angle = angle % (Math.PI * 2);
			return angle;
		};
		this.angle = function(p) {
			// y is upside down to account for inverted canvas
			var dx = p.x - this.x;
			var dy = this.y - p.y;
			var angle = 0;
			// Calculate angle
			if (dx == 0) {
				if (dy == 0) {
					angle = 0;
				} else if (dy > 0) {
					angle = Math.PI / 2;
				} else {
					angle = 3 * Math.PI / 2;
				}
			} else if (dy == 0) {
				if (dx > 0) {
					angle = 0;
				} else {
					angle = Math.PI;
				}
			} else {
				if (dx < 0) {
					angle = Math.atan(dy / dx) + Math.PI;
				} else if (dy < 0) {
					angle = Math.atan(dy / dx) + 2 * Math.PI;
				} else {
					angle = Math.atan(dy / dx);
				}
			}
			while (angle < 0) {
				angle += Math.PI * 2;
			}
			angle = angle % (Math.PI * 2);
			return angle;
		};
	};

	iview.Atom = function(label, x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.charge = 0;
		this.numLonePair = 0;
		this.mass = -1;
		this.coordinationNumber = 0;
		this.bondNumber = 0;
		this.angleOfLeastInterference = 0;
		this.isHidden = false;
		this.label = label ? label.replace(/\s/g, '') : 'C';
		this.altLabel = null;
		this.isLone = false;
		this.isHover = false;
		this.isSelected = false;
		this.add3D = function(p) {
			this.x += p.x;
			this.y += p.y;
			this.z += p.z;
		};
		this.sub3D = function(p) {
			this.x -= p.x;
			this.y -= p.y;
			this.z -= p.z;
		};
		this.distance3D = function(p) {
			var dx = p.x - this.x;
			var dy = p.y - this.y;
			var dz = p.z - this.z;
			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		};
		this.draw = function(ctx, specs) {
			this.textBounds = [];
			if (this.specs) {
				specs = this.specs;
			}
			var font = specs.getFontString(specs.atoms_font_size_2D, specs.atoms_font_families_2D, specs.atoms_font_bold_2D, specs.atoms_font_italic_2D);
			ctx.font = font;
			ctx.fillStyle = iview.ELEMENT[this.label].color;
			if (this.isLone && !specs.atoms_displayAllCarbonLabels_2D || specs.atoms_circles_2D) {
				ctx.beginPath();
				ctx.arc(this.x, this.y, specs.atoms_circleDiameter_2D / 2, 0, Math.PI * 2, false);
				ctx.fill();
				if (specs.atoms_circleBorderWidth_2D > 0) {
					ctx.lineWidth = specs.atoms_circleBorderWidth_2D;
					ctx.strokeStyle = 'black';
					ctx.stroke(this.x, this.y, 0, Math.PI * 2, specs.atoms_circleDiameter_2D / 2);
				}
			} else if (this.isLabelVisible(specs)) {
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				if (this.altLabel != undefined) {
					// altLabel can be 0, so check if undefined
					ctx.fillText(this.altLabel, this.x, this.y);
					var symbolWidth = ctx.measureText(this.altLabel).width;
					this.textBounds.push({
						x : this.x - symbolWidth / 2,
						y : this.y - specs.atoms_font_size_2D / 2+1,
						w : symbolWidth,
						h : specs.atoms_font_size_2D-2
					});
				} else {
					ctx.fillText(this.label, this.x, this.y);
					var symbolWidth = ctx.measureText(this.label).width;
					this.textBounds.push({
						x : this.x - symbolWidth / 2,
						y : this.y - specs.atoms_font_size_2D / 2+1,
						w : symbolWidth,
						h : specs.atoms_font_size_2D-2
					});
					if (this.mass != -1) {
						var subFont = specs.getFontString(specs.atoms_font_size_2D * .7, specs.atoms_font_families_2D, specs.atoms_font_bold_2D, specs.atoms_font_italic_2D);
						var fontSave = ctx.font;
						ctx.font = subFont;
						var massWidth = ctx.measureText(this.mass).width;
						ctx.fillText(this.mass, this.x - massWidth - .5, this.y - specs.atoms_font_size_2D * .3);
						ctx.font = fontSave;
					}
					// implicit hydrogens
					var numHs = this.getImplicitHydrogenCount();
					if (specs.atoms_implicitHydrogens_2D && numHs > 0) {
						var hWidth = ctx.measureText('H').width;
						if (numHs > 1) {
							var xoffset = symbolWidth / 2 + hWidth / 2;
							var yoffset = 0;
							var subFont = specs.getFontString(specs.atoms_font_size_2D * .8, specs.atoms_font_families_2D, specs.atoms_font_bold_2D, specs.atoms_font_italic_2D);
							ctx.font = subFont;
							var numWidth = ctx.measureText(numHs).width;
							if (this.bondNumber == 1) {
								if (this.angleOfLeastInterference > Math.PI / 2 && this.angleOfLeastInterference < 3 * Math.PI / 2) {
									xoffset = -symbolWidth / 2 - numWidth - hWidth / 2;
								}
							} else {
								if (this.angleOfLeastInterference <= Math.PI / 4) {
									// default
								} else if (this.angleOfLeastInterference < 3 * Math.PI / 4) {
									xoffset = 0;
									yoffset = -specs.atoms_font_size_2D * .9;
								} else if (this.angleOfLeastInterference <= 5 * Math.PI / 4) {
									xoffset = -symbolWidth / 2 - numWidth - hWidth / 2;
								} else if (this.angleOfLeastInterference < 7 * Math.PI / 4) {
									xoffset = 0;
									yoffset = specs.atoms_font_size_2D * .9;
								}
							}
							ctx.font = font;
							ctx.fillText('H', this.x + xoffset, this.y + yoffset);
							ctx.font = subFont;
							ctx.fillText(numHs, this.x + xoffset + hWidth / 2 + numWidth / 2, this.y + yoffset + specs.atoms_font_size_2D * .3);
							this.textBounds.push({
								x : this.x + xoffset - hWidth / 2,
								y : this.y + yoffset - specs.atoms_font_size_2D / 2+1,
								w : hWidth,
								h : specs.atoms_font_size_2D-2
							});
							this.textBounds.push({
								x : this.x + xoffset+ hWidth / 2,
								y : this.y + yoffset + specs.atoms_font_size_2D * .3 - specs.atoms_font_size_2D / 2+1,
								w : numWidth,
								h : specs.atoms_font_size_2D * .8-2
							});
						} else {
							var xoffset = symbolWidth / 2 + hWidth / 2;
							var yoffset = 0;
							if (this.bondNumber == 1) {
								if (this.angleOfLeastInterference > Math.PI / 2 && this.angleOfLeastInterference < 3 * Math.PI / 2) {
									xoffset = -symbolWidth / 2 - hWidth / 2;
								}
							} else {
								if (this.angleOfLeastInterference <= Math.PI / 4) {
									// default
								} else if (this.angleOfLeastInterference < 3 * Math.PI / 4) {
									xoffset = 0;
									yoffset = -specs.atoms_font_size_2D * .9;
								} else if (this.angleOfLeastInterference <= 5 * Math.PI / 4) {
									xoffset = -symbolWidth / 2 - hWidth / 2;
								} else if (this.angleOfLeastInterference < 7 * Math.PI / 4) {
									xoffset = 0;
									yoffset = specs.atoms_font_size_2D * .9;
								}
							}
							ctx.fillText('H', this.x + xoffset, this.y + yoffset);
							this.textBounds.push({
								x : this.x + xoffset - hWidth / 2,
								y : this.y + yoffset - specs.atoms_font_size_2D / 2+1,
								w : hWidth,
								h : specs.atoms_font_size_2D-2
							});
						}
					}
				}
				if (this.charge != 0) {
					var s = this.charge.toFixed(0);
					if (s == '1') {
						s = '+';
					} else if (s == '-1') {
						s = '\u2013';
					} else if (iview.stringStartsWith(s, '-')) {
						s = s.substring(1) + '\u2013';
					} else {
						s += '+';
					}
					var angleUse = this.angleOfLeastInterference;
					var distanceUse = specs.atoms_font_size_2D;
					if (this.isLabelVisible(specs) && numHs > 0) {
						angleUse += Math.PI / 4;
					}
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(s, this.x + distanceUse * Math.cos(angleUse), this.y - distanceUse * Math.sin(angleUse));
				}
				if (this.numLonePair > 0) {
					ctx.fillStyle = 'black';
					if (this.bondNumber == 2 && Math.abs(this.largestAngle - Math.PI) < Math.PI / 60) {
						this.drawLonePairs(ctx, specs, Math.floor(this.numLonePair / 2), this.angleOfLeastInterference, this.largestAngle);
						this.drawLonePairs(ctx, specs, Math.floor(this.numLonePair / 2) + this.numLonePair % 2, this.angleOfLeastInterference + Math.PI, this.largestAngle);
					} else {
						this.drawLonePairs(ctx, specs, this.numLonePair, this.angleOfLeastInterference, this.largestAngle);
					}
				}
			}
		};
		this.drawLonePairs = function(ctx, specs, num, angle, largest) {
			var segment = largest / (num + (this.bondNumber == 0 ? 0 : 1));
			var angleStart = angle - largest / 2 + segment;
			for ( var i = 0; i < num; i++) {
				var angle = angleStart + i * segment;
				var p1x = this.x + Math.cos(angle) * specs.atoms_lonePairDistance_2D;
				var p1y = this.y - Math.sin(angle) * specs.atoms_lonePairDistance_2D;
				var perp = angle + Math.PI / 2;
				var difx = Math.cos(perp) * specs.atoms_lonePairSpread_2D / 2;
				var dify = -Math.sin(perp) * specs.atoms_lonePairSpread_2D / 2;
				ctx.beginPath();
				ctx.arc(p1x + difx, p1y + dify, specs.atoms_lonePairDiameter_2D, 0, Math.PI * 2, false);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(p1x - difx, p1y - dify, specs.atoms_lonePairDiameter_2D, 0, Math.PI * 2, false);
				ctx.fill();
			}
		};
		this.drawDecorations = function(ctx) {
			if (this.isHover || this.isSelected) {
				ctx.strokeStyle = this.isHover ? '#885110' : '#0060B2';
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				var radius = this.isHover ? 7 : 15;
				ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
				ctx.stroke();
			}
		};
		this.render = function(gl, specs) {
			var transform = mat4.translate(gl.modelViewMatrix, [ this.x, this.y, this.z ], []);
			var radius = specs.atoms_useVDWDiameters_3D ? iview.ELEMENT[this.label].vdWRadius * specs.atoms_vdwMultiplier_3D : specs.atoms_sphereDiameter_3D / 2;
			if (radius == 0) {
				radius = 1;
			}
			mat4.scale(transform, [ radius, radius, radius ]);
			// colors
			var color = iview.ELEMENT[this.label].color;
			gl.material.setDiffuseColor(color);
			// render
			gl.setMatrixUniforms(transform);
			var buffer = gl.sphereBuffer;
			gl.drawElements(gl.TRIANGLES, buffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		};
		this.isLabelVisible = function(specs) {
			return specs.atoms_displayAllCarbonLabels_2D || this.label != 'C' || this.altLabel || this.mass != -1 || this.charge != 0 || this.numLonePair != 0 || (this.isHidden && specs.atoms_showHiddenCarbons_2D) || (specs.atoms_displayTerminalCarbonLabels_2D && this.bondNumber == 1);
		};
		this.getImplicitHydrogenCount = function() {
			if (this.label == 'H' || iview.ELEMENT[this.label] == null) {
				return 0;
			}
			var valence = iview.ELEMENT[this.label].valency;
			var dif = valence - this.coordinationNumber;
			if (this.charge > 0) {
				var vdif = 4 - valence;
				if (this.charge <= vdif) {
					dif += this.charge;
				} else {
					dif = 4 - this.coordinationNumber - this.charge + vdif;
				}
			} else {
				dif += this.charge;
			}
			return dif < 0 ? 0 : dif;
		};
	};
	iview.Atom.prototype = new iview.Point(0, 0);

	iview.Bond = function(a1, a2, bondOrder) {
		this.a1 = a1;
		this.a2 = a2;
		this.bondOrder = bondOrder ? bondOrder : 1;
		this.stereo = iview.Bond.STEREO_NONE;
		this.isHover = false;
		this.getCenter = function() {
			return new iview.Point((this.a1.x + this.a2.x) / 2, (this.a1.y + this.a2.y) / 2);
		};
		this.getLength = function() {
			return this.a1.distance(this.a2);
		};
		this.getLength3D = function() {
			return this.a1.distance3D(this.a2);
		};
		this.contains = function(a) {
			return a == this.a1 || a == this.a2;
		};
		this.getNeighbor = function(a) {
			if (a == this.a1) {
				return this.a2;
			} else if (a == this.a2) {
				return this.a1;
			}
			return null;
		};
		this.draw = function(ctx, specs) {
			if(this.a1.x==this.a2.x&&this.a1.y==this.a2.y){
				// return, as there is nothing to render, will only cause fill overflows
				return;
			}
			var x1 = this.a1.x;
			var x2 = this.a2.x;
			var y1 = this.a1.y;
			var y2 = this.a2.y;
			var dist = this.a1.distance(this.a2);
			var difX = x2 - x1;
			var difY = y2 - y1;
			if (specs.atoms_display && !specs.atoms_circles_2D && this.a1.isLabelVisible(specs)) {
				var distShrink = 0;
				for(var i = 0, ii = this.a1.textBounds.length; i<ii; i++){
					distShrink = Math.max(distShrink, iview.calculateDistanceInterior(this.a1, this.a2, this.a1.textBounds[i]));
				}
				distShrink += specs.bonds_atomLabelBuffer_2D;
				var perc = distShrink / dist;
				x1 += difX * perc;
				y1 += difY * perc;
			}
			if (specs.atoms_display && !specs.atoms_circles_2D && this.a2.isLabelVisible(specs)) {
				var distShrink = 0;
				for(var i = 0, ii = this.a2.textBounds.length; i<ii; i++){
					distShrink = Math.max(distShrink, iview.calculateDistanceInterior(this.a2, this.a1, this.a2.textBounds[i]));
				}
				distShrink += specs.bonds_atomLabelBuffer_2D;
				var perc = distShrink / dist;
				x2 -= difX * perc;
				y2 -= difY * perc;
			}
			if (specs.bonds_clearOverlaps_2D) {
				var xs = x1 + difX * .15;
				var ys = y1 + difY * .15;
				var xf = x2 - difX * .15;
				var yf = y2 - difY * .15;
				ctx.strokeStyle = specs.backgroundColor;
				ctx.lineWidth = specs.bonds_width_2D + specs.bonds_overlapClearWidth_2D * 2;
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(xs, ys);
				ctx.lineTo(xf, yf);
				ctx.closePath();
				ctx.stroke();
			}
			ctx.strokeStyle = specs.bonds_color;
			ctx.fillStyle = specs.bonds_color;
			ctx.lineWidth = specs.bonds_width_2D;
			ctx.lineCap = specs.bonds_ends_2D;
			var linearGradient = ctx.createLinearGradient(x1, y1, x2, y2);
			var color1 = iview.ELEMENT[this.a1.label].color;
			var color2 = iview.ELEMENT[this.a2.label].color;
			linearGradient.addColorStop(0, color1);
			if(!specs.bonds_colorGradient){
				linearGradient.addColorStop(0.5, color1);
				linearGradient.addColorStop(0.51, color2);
			}
			linearGradient.addColorStop(1, color2);
			ctx.strokeStyle = linearGradient;
			ctx.fillStyle = linearGradient;
			switch (this.bondOrder) {
			case 0.5:
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				iview.contextHashTo(ctx, x1, y1, x2, y2, specs.bonds_hashSpacing_2D, specs.bonds_hashSpacing_2D);
				ctx.stroke();
				break;
			case 1:
				if (this.stereo == iview.Bond.STEREO_PROTRUDING || this.stereo == iview.Bond.STEREO_RECESSED) {
					var thinSpread = specs.bonds_width_2D / 2;
					var useDist = this.a1.distance(this.a2) * specs.bonds_wedgeThickness_2D / 2;
					var perpendicular = this.a1.angle(this.a2) + Math.PI / 2;
					var mcosp = Math.cos(perpendicular);
					var msinp = Math.sin(perpendicular);
					var cx1 = x1 - mcosp * thinSpread;
					var cy1 = y1 + msinp * thinSpread;
					var cx2 = x1 + mcosp * thinSpread;
					var cy2 = y1 - msinp * thinSpread;
					var cx3 = x2 + mcosp * useDist;
					var cy3 = y2 - msinp * useDist;
					var cx4 = x2 - mcosp * useDist;
					var cy4 = y2 + msinp * useDist;
					ctx.beginPath();
					ctx.moveTo(cx1, cy1);
					ctx.lineTo(cx2, cy2);
					ctx.lineTo(cx3, cy3);
					ctx.lineTo(cx4, cy4);
					ctx.closePath();
					if (this.stereo == iview.Bond.STEREO_PROTRUDING) {
						ctx.fill();
					} else {
						ctx.save();
						ctx.clip();
						ctx.lineWidth = useDist * 2;
						ctx.lineCap = 'butt';
						ctx.beginPath();
						ctx.moveTo(x1, y1);
						iview.contextHashTo(ctx, x1, y1, x2, y2, specs.bonds_hashWidth_2D, specs.bonds_hashSpacing_2D);
						ctx.stroke();
						ctx.restore();
					}
				} else if (this.stereo == iview.Bond.STEREO_AMBIGUOUS) {
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					var curves = Math.floor(Math.sqrt(difX * difX + difY * difY) / specs.bonds_wavyLength_2D);
					var x = x1;
					var y = y1;
					var perpendicular = this.a1.angle(this.a2) + Math.PI / 2;
					var mcosp = Math.cos(perpendicular);
					var msinp = Math.sin(perpendicular);

					var curveX = difX / curves;
					var curveY = difY / curves;
					var cpx1, cpx2, cpy1, cpy2;
					for ( var i = 0, ii = curves; i < ii; i++) {
						x += curveX;
						y += curveY;
						cpx1 = specs.bonds_wavyLength_2D * mcosp + x - curveX * 0.5;
						cpy1 = specs.bonds_wavyLength_2D * -msinp + y - curveY * 0.5;
						cpx2 = specs.bonds_wavyLength_2D * -mcosp + x - curveX * 0.5;
						cpy2 = specs.bonds_wavyLength_2D * msinp + y - curveY * 0.5;
						if (i % 2 == 0) {
							ctx.quadraticCurveTo(cpx1, cpy1, x, y);
						} else {
							ctx.quadraticCurveTo(cpx2, cpy2, x, y);
						}
					}
					ctx.stroke();
					break;
				} else {
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
				}
				break;
			case 1.5:
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
				break;
			case 2:
				if (this.stereo == iview.Bond.STEREO_AMBIGUOUS) {
					var useDist = this.a1.distance(this.a2) * specs.bonds_saturationWidth_2D / 2;
					var perpendicular = this.a1.angle(this.a2) + Math.PI / 2;
					var cx1 = x1 - Math.cos(perpendicular) * useDist;
					var cy1 = y1 + Math.sin(perpendicular) * useDist;
					var cx2 = x1 + Math.cos(perpendicular) * useDist;
					var cy2 = y1 - Math.sin(perpendicular) * useDist;
					var cx3 = x2 + Math.cos(perpendicular) * useDist;
					var cy3 = y2 - Math.sin(perpendicular) * useDist;
					var cx4 = x2 - Math.cos(perpendicular) * useDist;
					var cy4 = y2 + Math.sin(perpendicular) * useDist;
					ctx.beginPath();
					ctx.moveTo(cx1, cy1);
					ctx.lineTo(cx3, cy3);
					ctx.moveTo(cx2, cy2);
					ctx.lineTo(cx4, cy4);
					ctx.stroke();
				} else if (!specs.bonds_symmetrical_2D && (this.ring != null || this.a1.label == 'C' && this.a2.label == 'C')) {
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					var clip = 0;
					var dist = this.a1.distance(this.a2);
					var angle = this.a1.angle(this.a2);
					var perpendicular = angle + Math.PI / 2;
					var useDist = dist * specs.bonds_saturationWidth_2D;
					var clipAngle = Math.PI / 3;
					if (clipAngle < Math.PI / 2) {
						clip = -(useDist / Math.tan(clipAngle));
					}
					if (Math.abs(clip) < dist / 2) {
						var xuse1 = x1 - Math.cos(angle) * clip;
						var xuse2 = x2 + Math.cos(angle) * clip;
						var yuse1 = y1 + Math.sin(angle) * clip;
						var yuse2 = y2 - Math.sin(angle) * clip;
						var cx1 = xuse1 - Math.cos(perpendicular) * useDist;
						var cy1 = yuse1 + Math.sin(perpendicular) * useDist;
						var cx2 = xuse1 + Math.cos(perpendicular) * useDist;
						var cy2 = yuse1 - Math.sin(perpendicular) * useDist;
						var cx3 = xuse2 - Math.cos(perpendicular) * useDist;
						var cy3 = yuse2 + Math.sin(perpendicular) * useDist;
						var cx4 = xuse2 + Math.cos(perpendicular) * useDist;
						var cy4 = yuse2 - Math.sin(perpendicular) * useDist;
						var flip = this.ring == null || (this.ring.center.angle(this.a1) > this.ring.center.angle(this.a2) && !(this.ring.center.angle(this.a1) - this.ring.center.angle(this.a2) > Math.PI) || (this.ring.center.angle(this.a1) - this.ring.center.angle(this.a2) < -Math.PI));
						if (flip) {
							ctx.moveTo(cx1, cy1);
							ctx.lineTo(cx3, cy3);
						} else {
							ctx.moveTo(cx2, cy2);
							ctx.lineTo(cx4, cy4);
						}
						ctx.stroke();
					}
				} else {
					var useDist = this.a1.distance(this.a2) * specs.bonds_saturationWidth_2D / 2;
					var perpendicular = this.a1.angle(this.a2) + Math.PI / 2;
					var cx1 = x1 - Math.cos(perpendicular) * useDist;
					var cy1 = y1 + Math.sin(perpendicular) * useDist;
					var cx2 = x1 + Math.cos(perpendicular) * useDist;
					var cy2 = y1 - Math.sin(perpendicular) * useDist;
					var cx3 = x2 + Math.cos(perpendicular) * useDist;
					var cy3 = y2 - Math.sin(perpendicular) * useDist;
					var cx4 = x2 - Math.cos(perpendicular) * useDist;
					var cy4 = y2 + Math.sin(perpendicular) * useDist;
					ctx.beginPath();
					ctx.moveTo(cx1, cy1);
					ctx.lineTo(cx4, cy4);
					ctx.moveTo(cx2, cy2);
					ctx.lineTo(cx3, cy3);
					ctx.stroke();
				}
				break;
			case 3:
				var useDist = this.a1.distance(this.a2) * specs.bonds_saturationWidth_2D;
				var perpendicular = this.a1.angle(this.a2) + Math.PI / 2;
				var cx1 = x1 - Math.cos(perpendicular) * useDist;
				var cy1 = y1 + Math.sin(perpendicular) * useDist;
				var cx2 = x1 + Math.cos(perpendicular) * useDist;
				var cy2 = y1 - Math.sin(perpendicular) * useDist;
				var cx3 = x2 + Math.cos(perpendicular) * useDist;
				var cy3 = y2 - Math.sin(perpendicular) * useDist;
				var cx4 = x2 - Math.cos(perpendicular) * useDist;
				var cy4 = y2 + Math.sin(perpendicular) * useDist;
				ctx.beginPath();
				ctx.moveTo(cx1, cy1);
				ctx.lineTo(cx4, cy4);
				ctx.moveTo(cx2, cy2);
				ctx.lineTo(cx3, cy3);
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
				break;
			}
		};
		this.drawDecorations = function(ctx) {
			if (this.isHover || this.isSelected) {
				var pi2 = 2 * Math.PI;
				var angle = (this.a1.angleForStupidCanvasArcs(this.a2) + Math.PI / 2) % pi2;
				ctx.strokeStyle = this.isHover ? '#885110' : '#0060B2';
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				var angleTo = (angle + Math.PI) % pi2;
				angleTo = angleTo % (Math.PI * 2);
				ctx.arc(this.a1.x, this.a1.y, 7, angle, angleTo, false);
				ctx.stroke();
				ctx.beginPath();
				angle += Math.PI;
				angleTo = (angle + Math.PI) % pi2;
				ctx.arc(this.a2.x, this.a2.y, 7, angle, angleTo, false);
				ctx.stroke();
			}
		};
		this.render = function(gl, specs) {
			// this is the elongation vector for the cylinder
			var height = (specs.bonds_renderAsLines_3D?1.1:1.001) * this.a1.distance3D(this.a2) / 2;
			if (height == 0) {
				// if there is no height, then no point in rendering this bond,
				// just return
				return false;
			}
			var scaleVector = [ specs.bonds_cylinderDiameter_3D / 2, height, specs.bonds_cylinderDiameter_3D / 2 ];
			// transform to the atom as well as the opposite atom
			var transform = mat4.translate(gl.modelViewMatrix, [ this.a1.x, this.a1.y, this.a1.z ], []);
			var transformOpposite = null;
			// align bond
			var a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
			vec3.scale(a2b, .5);
			transformOpposite = mat4.translate(gl.modelViewMatrix, [ this.a2.x, this.a2.y, this.a2.z ], []);
			// calculate the translations for unsaturated bonds
			var others = [ 0 ];
			var saturatedCross = null;
			if (specs.bonds_showBondOrders_3D) {
				switch (this.bondOrder) {
				case 2:
					others = [ -specs.bonds_cylinderDiameter_3D, specs.bonds_cylinderDiameter_3D ];
					break;
				case 3:
					others = [ -1.2 * specs.bonds_cylinderDiameter_3D, 0, 1.2 * specs.bonds_cylinderDiameter_3D ];
					break;
				}
				if (others.length > 1) {
					var z = [ 0, 0, 1 ];
					var inverse = mat4.inverse(gl.rotationMatrix, []);
					mat4.multiplyVec3(inverse, z);
					saturatedCross = vec3.cross(a2b, z, []);
					vec3.normalize(saturatedCross);
				}
			}
			// calculate the rotation
			var y = [ 0, 1, 0 ];
			var ang = 0;
			var axis = null;
			if (this.a1.x == this.a2.x && this.a1.z == this.a2.z) {
				axis = [ 0, 0, 1 ];
				if (this.a2.y < this.a1.y) {
					ang = Math.PI;
				}
			} else {
				ang = iview.vec3AngleFrom(y, a2b);
				axis = vec3.cross(y, a2b, []);
			}
			// render bonds
			for ( var i = 0, ii = others.length; i < ii; i++) {
				var transformUse = mat4.set(transform, []);
				if (others[i] != 0) {
					mat4.translate(transformUse, vec3.scale(saturatedCross, others[i], []));
				}
				if (ang != 0) {
					mat4.rotate(transformUse, ang, axis);
				}
				mat4.scale(transformUse, scaleVector);
				// colors
				var color = iview.ELEMENT[this.a1.label].color;
				gl.material.setDiffuseColor(color);
				// render
				gl.setMatrixUniforms(transformUse);
				if (specs.bonds_renderAsLines_3D) {
					gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
				}else {
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
				}
				mat4.set(transformOpposite, transformUse);
				if (others[i] != 0) {
					mat4.translate(transformUse, vec3.scale(saturatedCross, others[i], []));
				}
				// don't check for 0 here as that means it should be rotated
				// by PI, but PI will be negated
				mat4.rotate(transformUse, ang + Math.PI, axis);
				mat4.scale(transformUse, scaleVector);
				// colors
				gl.material.setDiffuseColor(iview.ELEMENT[this.a2.label].color);
				// render
				gl.setMatrixUniforms(transformUse);				
				if (specs.bonds_renderAsLines_3D) {
					gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
				}else {
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
				}
			}
		};
	};
	iview.Bond.STEREO_NONE = 'none';
	iview.Bond.STEREO_PROTRUDING = 'protruding';
	iview.Bond.STEREO_RECESSED = 'recessed';
	iview.Bond.STEREO_AMBIGUOUS = 'ambiguous';

	iview.Molecule = function() {
		this.atoms = [];
		this.bonds = [];
		this.draw = function(ctx, specs) {
			// need this weird render of atoms before and after, just in case circles are rendered, as those should be on top
			if (specs.atoms_display && !specs.atoms_circles_2D) {
				for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
					this.atoms[i].draw(ctx, specs);
				}
			}
			if (specs.bonds_display) {
				for ( var i = 0, ii = this.bonds.length; i < ii; i++) {
					this.bonds[i].draw(ctx, specs);
				}
			}
			if (specs.atoms_display && specs.atoms_circles_2D) {
				for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
					this.atoms[i].draw(ctx, specs);
				}
			}
		};
		this.render = function(gl, specs) {
			if (specs.macro_displayBonds) {
				if (this.bonds.length > 0) {
					if (specs.bonds_renderAsLines_3D) {
						gl.lineWidth(specs.bonds_width_2D);
						gl.lineBuffer.bindBuffers(gl);
					} else {
						gl.cylinderBuffer.bindBuffers(gl);
					}
					// colors
					gl.material.setTempColors(specs.bonds_materialAmbientColor_3D, null, specs.bonds_materialSpecularColor_3D, specs.bonds_materialShininess_3D);
				}
				for ( var i = 0, ii = this.bonds.length; i < ii; i++) {
					var b = this.bonds[i];
					if (!b.a1.hetatm && (specs.macro_atomToLigandDistance == -1 || (b.a1.closestDistance != undefined && specs.macro_atomToLigandDistance >= b.a1.closestDistance && specs.macro_atomToLigandDistance >= b.a2.closestDistance))) {
						b.render(gl, specs);
					}
				}
			}
			if (specs.macro_displayAtoms) {
				if (this.atoms.length > 0) {
					gl.sphereBuffer.bindBuffers(gl);
					// colors
					gl.material.setTempColors(specs.atoms_materialAmbientColor_3D, null, specs.atoms_materialSpecularColor_3D, specs.atoms_materialShininess_3D);
				}
				for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
					var a = this.atoms[i];
					if (!a.hetatm && (specs.macro_atomToLigandDistance == -1 || (a.closestDistance != undefined && specs.macro_atomToLigandDistance >= a.closestDistance))) {
						a.render(gl, specs);
					}
				}
			}
			if (specs.bonds_display) {
				if (this.bonds.length > 0) {
					if (specs.bonds_renderAsLines_3D) {
						gl.lineWidth(specs.bonds_width_2D);
						gl.lineBuffer.bindBuffers(gl);
					} else {
						gl.cylinderBuffer.bindBuffers(gl);
					}
					// colors
					gl.material.setTempColors(specs.bonds_materialAmbientColor_3D, null, specs.bonds_materialSpecularColor_3D, specs.bonds_materialShininess_3D);
				}
				for ( var i = 0, ii = this.bonds.length; i < ii; i++) {
					var b = this.bonds[i];
					if (b.a1.hetatm) {
						b.render(gl, specs);
					}
				}
			}
			if (specs.atoms_display) {
				for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
					var a = this.atoms[i];
					a.bondNumber = 0;
				}
				for ( var i = 0, ii = this.bonds.length; i < ii; i++) {
					var b = this.bonds[i];
					b.a1.bondNumber++;
					b.a2.bondNumber++;
				}
				if (this.atoms.length > 0) {
					gl.sphereBuffer.bindBuffers(gl);
					// colors
					gl.material.setTempColors(specs.atoms_materialAmbientColor_3D, null, specs.atoms_materialSpecularColor_3D, specs.atoms_materialShininess_3D);
				}
				for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
					var a = this.atoms[i];
					if (a.hetatm) {
						a.render(gl, specs);
					}
				}
			}
		};
		this.getCenter3D = function() {
			var minX = minY = minZ = Infinity;
			var maxX = maxY = maxZ = -Infinity;
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				minZ = Math.min(this.atoms[i].z, minZ);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
				maxZ = Math.max(this.atoms[i].z, maxZ);
			}
			return new iview.Atom('C', (maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
		};
		this.getCenter = function() {
			var minX = minY = Infinity;
			var maxX = maxY = -Infinity;
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
			}
			return new iview.Point((maxX + minX) / 2, (maxY + minY) / 2);
		};
		this.getDimension = function() {
			var minX = minY = Infinity;
			var maxX = maxY = -Infinity;
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
			}
			return new iview.Point(maxX - minX, maxY - minY);
		};
	};

	iview.Mesh = function() {
	};
	iview.Mesh.prototype.storeData = function(positionData, normalData, indexData) {
		this.positionData = positionData;
		this.normalData = normalData;
		this.indexData = indexData;
	};
	iview.Mesh.prototype.setupBuffers = function(gl) {
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData), gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = this.positionData.length / 3;

		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData), gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = this.normalData.length / 3;
		
		if (this.indexData) {
			this.vertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), gl.STATIC_DRAW);
			this.vertexIndexBuffer.itemSize = 1;
			this.vertexIndexBuffer.numItems = this.indexData.length;
		}
		
		if(this.partitions){
			for(var i = 0, ii = this.partitions.length; i<ii; i++){
				var p = this.partitions[i];
				var buffers = this.generateBuffers(gl, p.positionData, p.normalData, p.indexData);
				p.vertexPositionBuffer = buffers[0];
				p.vertexNormalBuffer = buffers[1];
				p.vertexIndexBuffer = buffers[2];
			}
		}
	};
	iview.Mesh.prototype.generateBuffers = function(gl, positionData, normalData, indexData) {
		var vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
		vertexPositionBuffer.itemSize = 3;
		vertexPositionBuffer.numItems = positionData.length / 3;

		var vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
		vertexNormalBuffer.itemSize = 3;
		vertexNormalBuffer.numItems = normalData.length / 3;
		
		var vertexIndexBuffer = null;
		if (indexData) {
			vertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
			vertexIndexBuffer.itemSize = 1;
			vertexIndexBuffer.numItems = indexData.length;
		}
		
		return [vertexPositionBuffer, vertexNormalBuffer, vertexIndexBuffer];
	};
	iview.Mesh.prototype.bindBuffers = function(gl) {
		if(!this.vertexPositionBuffer){
			this.setupBuffers(gl);
		}
		// positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(gl.shader.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		// normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.vertexAttribPointer(gl.shader.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		if (this.vertexIndexBuffer) {
			// indexes
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		}
	};

	iview.Cylinder = function(radius, height, bands) {
		var positionData = [];
		var normalData = [];
		for ( var i = 0; i < bands; i++) {
			var theta = i * 2 * Math.PI / bands;
			var cosTheta = Math.cos(theta);
			var sinTheta = Math.sin(theta);
			normalData.push(cosTheta, 0, sinTheta);
			positionData.push(radius * cosTheta, 0, radius * sinTheta);
			normalData.push(cosTheta, 0, sinTheta);
			positionData.push(radius * cosTheta, height, radius * sinTheta);
		}
		normalData.push(1, 0, 0);
		positionData.push(radius, 0, 0);
		normalData.push(1, 0, 0);
		positionData.push(radius, height, 0);

		this.storeData(positionData, normalData);
	};
	iview.Cylinder.prototype = new iview.Mesh();

	iview.Sphere = function(radius, latitudeBands, longitudeBands) {
		var positionData = [];
		var normalData = [];
		for ( var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
			var theta = latNumber * Math.PI / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for ( var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
				var phi = longNumber * 2 * Math.PI / longitudeBands;
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);

				var x = cosPhi * sinTheta;
				var y = cosTheta;
				var z = sinPhi * sinTheta;

				normalData.push(x, y, z);
				positionData.push(radius * x, radius * y, radius * z);
			}
		}

		var indexData = [];
		longitudeBands += 1;
		for ( var latNumber = 0; latNumber < latitudeBands; latNumber++) {
			for ( var longNumber = 0; longNumber < longitudeBands; longNumber++) {
				var first = (latNumber * longitudeBands) + (longNumber % longitudeBands);
				var second = first + longitudeBands;
				indexData.push(first);
				indexData.push(second);
				indexData.push(first + 1);
				if (longNumber < longitudeBands - 1) {
					indexData.push(second);
					indexData.push(second + 1);
					indexData.push(first + 1);
				}
			}
		}

		this.storeData(positionData, normalData, indexData);
	};
	iview.Sphere.prototype = new iview.Mesh();

	iview.Light = function(diffuseColor, specularColor, direction, gl) {
		this.diffuseRGB = iview.getRGB(diffuseColor);
		this.specularRGB = iview.getRGB(specularColor);
		this.direction = direction;
		var prefix = 'u_light.';
		gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'diffuse_color'), this.diffuseRGB[0], this.diffuseRGB[1], this.diffuseRGB[2]);
		gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'specular_color'), this.specularRGB[0], this.specularRGB[1], this.specularRGB[2]);

		var lightingDirection = vec3.create(this.direction);
		vec3.normalize(lightingDirection);
		vec3.negate(lightingDirection);
		gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'direction'), lightingDirection[0], lightingDirection[1], lightingDirection[2]);

		// compute the half vector
		var eyeVector = [ 0, 0, 0 ];
		var halfVector = [ eyeVector[0] + lightingDirection[0], eyeVector[1] + lightingDirection[1], eyeVector[2] + lightingDirection[2] ];
		var length = vec3.length(halfVector);
		if (length == 0)
			halfVector = [ 0, 0, 1 ];
		else {
			vec3.scale(1 / length);
		}
		gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'half_vector'), halfVector[0], halfVector[1], halfVector[2]);
	};

	iview.Material = function(gl) {
		var prefix = 'u_material.';
		var aUL = gl.getUniformLocation(gl.program, prefix + 'ambient_color');
		var dUL = gl.getUniformLocation(gl.program, prefix + 'diffuse_color');
		var sUL = gl.getUniformLocation(gl.program, prefix + 'specular_color');
		var snUL = gl.getUniformLocation(gl.program, prefix + 'shininess');
		var alUL = gl.getUniformLocation(gl.program, prefix + 'alpha');
		this.setTempColors = function(ambientColor, diffuseColor, specularColor, shininess) {
			if(!this.aCache || this.aCache!=ambientColor){
				this.aCache = ambientColor;
				var cs = iview.getRGB(ambientColor);
				gl.uniform3f(aUL, cs[0], cs[1], cs[2]);
			}
			if(diffuseColor!=null && (!this.dCache || this.dCache!=diffuseColor)){
				this.dCache = diffuseColor;
				var cs = iview.getRGB(diffuseColor);
				gl.uniform3f(dUL, cs[0], cs[1], cs[2]);
			}
			if(!this.sCache || this.sCache!=specularColor){
				this.sCache = specularColor;
				var cs = iview.getRGB(specularColor);
				gl.uniform3f(sUL, cs[0], cs[1], cs[2]);
			}
			if(!this.snCache || this.snCache!=shininess){
				this.snCache = shininess;
				gl.uniform1f(snUL, shininess);
			}
			this.alCache = 1;
			gl.uniform1f(alUL, 1);
		};
		this.setDiffuseColor = function(diffuseColor) {
			if(!this.dCache || this.dCache!=diffuseColor){
				this.dCache = diffuseColor;
				var cs = iview.getRGB(diffuseColor);
				gl.uniform3f(dUL, cs[0], cs[1], cs[2]);
			}
		};
	};

	iview.Shader = function(gl) {
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, [	// phong shader
			'struct Light',
			'{',
				'vec3 diffuse_color;',
				'vec3 specular_color;',
				'vec3 direction;',
				'vec3 half_vector;',
			'};',
			'struct Material',
			'{',
				'vec3 ambient_color;',
				'vec3 diffuse_color;',
				'vec3 specular_color;',
				'float shininess;',
				'float alpha;',
			'};',
			// attributes set when rendering objects
			'attribute vec3 a_vertex_position;',
			'attribute vec3 a_vertex_normal;',
			// scene structs
			'uniform Light u_light;',
			'uniform Material u_material;',
			// matrices set by gl.setMatrixUniforms
			'uniform mat4 u_model_view_matrix;',
			'uniform mat4 u_projection_matrix;',
			'uniform mat3 u_normal_matrix;',
			// sent to the fragment shader
			'varying vec4 v_diffuse;',
			'varying vec4 v_ambient;',
			'varying vec3 v_normal;',
			'varying vec3 v_light_direction;',
			'void main(void)',
			'{',
				'if (length(a_vertex_normal) == 0.0)',
				'{',
					'v_normal = a_vertex_normal;',
				'}',
				'else',
				'{',
					'v_normal = normalize(u_normal_matrix * a_vertex_normal);',
				'}',
				'vec4 diffuse = vec4(u_light.diffuse_color, 1.0);',
				'v_light_direction = u_light.direction;',
				'v_ambient = vec4(u_material.ambient_color, 1.0);',
				'v_diffuse = vec4(u_material.diffuse_color, 1.0) * diffuse;',
				'gl_Position = u_projection_matrix * u_model_view_matrix * vec4(a_vertex_position, 1.0);',
			'}'
		].join(''));
		gl.compileShader(vertexShader);

		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, [
			'precision mediump float;',
			'struct Light',
			'{',
				'vec3 diffuse_color;',
				'vec3 specular_color;',
				'vec3 direction;',
				'vec3 half_vector;',
			'};',
			'struct Material',
			'{',
				'vec3 ambient_color;',
				'vec3 diffuse_color;',
				'vec3 specular_color;',
				'float shininess;',
				'float alpha;',
			'};',
			// scene structs
			'uniform Light u_light;',
			'uniform Material u_material;',
			// from the vertex shader
			'varying vec4 v_diffuse;',
			'varying vec4 v_ambient;',
			'varying vec3 v_normal;',
			'varying vec3 v_light_direction;',
			'void main(void)',
			'{',
				'if (length(v_normal)==0.0)',
				'{',
					'gl_FragColor = vec4(v_diffuse.rgba);',
				'}',
				'else',
				'{',
					'float nDotL = max(dot(v_normal, v_light_direction), 0.0);',
					'vec4 color = vec4(v_diffuse.rgb*nDotL, v_diffuse.a);',
					'float nDotHV = max(dot(v_normal, u_light.half_vector), 0.0);',
					'vec4 specular = vec4(u_material.specular_color * u_light.specular_color, 1.0);',
					'color += vec4(specular.rgb * pow(nDotHV, u_material.shininess), specular.a);',
					// fogging
					//'float z = gl_FragCoord.z / gl_FragCoord.w;',
					//'float fog = z*z/20000.0;',
					//'color -= vec4(fog, fog, fog, 0);',
					// set the color
					'gl_FragColor = color + v_ambient;',
					'gl_FragColor.a *= u_material.alpha;',
				'}',
			'}'
		].join(''));
		gl.compileShader(fragmentShader);

		gl.attachShader(gl.program, vertexShader);
		gl.attachShader(gl.program, fragmentShader);
		gl.linkProgram(gl.program);
		gl.useProgram(gl.program);

		this.vertexPositionAttribute = gl.getAttribLocation(gl.program, 'a_vertex_position');
		gl.enableVertexAttribArray(this.vertexPositionAttribute);
		this.vertexNormalAttribute = gl.getAttribLocation(gl.program, 'a_vertex_normal');
		gl.enableVertexAttribArray(this.vertexNormalAttribute);
	};

	iview.VisualSpecifications = function() {

		// canvas properties
		this.backgroundColor = '#FFFFFF';

		// atom properties
		this.atoms_display = true;
		this.atoms_color = '#000000';
		this.atoms_font_size_2D = 12;
		this.atoms_font_families_2D = [ 'Helvetica', 'Arial', 'Dialog' ];
		this.atoms_font_bold_2D = false;
		this.atoms_font_italic_2D = false;
		this.atoms_circles_2D = false;
		this.atoms_circleDiameter_2D = 10;
		this.atoms_circleBorderWidth_2D = 1;
		this.atoms_lonePairDistance_2D = 8;
		this.atoms_lonePairSpread_2D = 4;
		this.atoms_lonePairDiameter_2D = 1;
		this.atoms_resolution_3D = 60;
		this.atoms_sphereDiameter_3D = .8;
		this.atoms_useVDWDiameters_3D = false;
		this.atoms_vdwMultiplier_3D = 1;
		this.atoms_materialAmbientColor_3D = '#000000';
		this.atoms_materialSpecularColor_3D = '#555555';
		this.atoms_materialShininess_3D = 32;
		this.atoms_implicitHydrogens_2D = true;
		this.atoms_displayTerminalCarbonLabels_2D = false;
		this.atoms_showHiddenCarbons_2D = true;
		this.atoms_displayAllCarbonLabels_2D = false;

		// bond properties
		this.bonds_display = true;
		this.bonds_color = '#777777';
		this.bonds_width_2D = 1;
		this.bonds_saturationWidth_2D = .2;
		this.bonds_ends_2D = 'round';
		this.bonds_colorGradient = false;
		this.bonds_symmetrical_2D = false;
		this.bonds_clearOverlaps_2D = false;
		this.bonds_overlapClearWidth_2D = .5;
		this.bonds_atomLabelBuffer_2D = 1;
		this.bonds_wedgeThickness_2D = .22;
		this.bonds_hashWidth_2D = 1;
		this.bonds_hashSpacing_2D = 2.5;
		this.bonds_showBondOrders_3D = false;
		this.bonds_resolution_3D = 60;
		this.bonds_renderAsLines_3D = false;
		this.bonds_cylinderDiameter_3D = .8;
		this.bonds_materialAmbientColor_3D = '#000000';
		this.bonds_materialSpecularColor_3D = '#555555';
		this.bonds_materialShininess_3D = 32;

		// macromolecular properties
		this.macro_displayAtoms = true;
		this.macro_displayBonds = true;
		this.macro_atomToLigandDistance = -1;

		this.getFontString = function(size, families, bold, italic) {
			var sb = [];
			if (bold) {
				sb.push('bold ');
			}
			if (italic) {
				sb.push('italic ');
			}
			sb.push(size + 'px ');
			for ( var i = 0, ii = families.length; i < ii; i++) {
				var use = families[i];
				if (use.indexOf(' ') != -1) {
					use = '"' + use + '"';
				}
				sb.push((i != 0 ? ',' : '') + use);
			}
			return sb.join('');
		};
	};

	return iview;

})();

iview.monitor = (function() {

	var m = {};
	m.CANVAS_DRAGGING = null;
	m.CANVAS_OVER = null;
	m.ALT = false;
	m.SHIFT = false;
	m.META = false;

	var doc = $(document);
	doc.ready(function() {
		// handles dragging beyond the canvas bounds
		doc.mousemove(function(e) {
			if (m.CANVAS_DRAGGING != null) {
				if (m.CANVAS_DRAGGING.drag) {
					m.CANVAS_DRAGGING.prehandleEvent(e);
					m.CANVAS_DRAGGING.drag(e);
				}
			}
		});
		doc.mouseup(function(e) {
			if (m.CANVAS_DRAGGING != null && m.CANVAS_DRAGGING != m.CANVAS_OVER) {
				if (m.CANVAS_DRAGGING.mouseup) {
					m.CANVAS_DRAGGING.prehandleEvent(e);
					m.CANVAS_DRAGGING.mouseup(e);
				}
			}
			m.CANVAS_DRAGGING = null;
		});
		// handles modifier keys from a single keyboard
		doc.keydown(function(e) {
			m.SHIFT = e.shiftKey;
			m.ALT = e.altKey;
			m.META = e.metaKey;
			var affecting = m.CANVAS_OVER;
			if (m.CANVAS_DRAGGING != null) {
				affecting = m.CANVAS_DRAGGING;
			}
			if (affecting != null) {
				if (affecting.keydown) {
					affecting.prehandleEvent(e);
					affecting.keydown(e);
				}
			}
		});
		doc.keypress(function(e) {
			var affecting = m.CANVAS_OVER;
			if (m.CANVAS_DRAGGING != null) {
				affecting = m.CANVAS_DRAGGING;
			}
			if (affecting != null) {
				if (affecting.keypress) {
					affecting.prehandleEvent(e);
					affecting.keypress(e);
				}
			}
		});
		doc.keyup(function(e) {
			m.SHIFT = e.shiftKey;
			m.ALT = e.altKey;
			m.META = e.metaKey;
			var affecting = m.CANVAS_OVER;
			if (m.CANVAS_DRAGGING != null) {
				affecting = m.CANVAS_DRAGGING;
			}
			if (affecting != null) {
				if (affecting.keyup) {
					affecting.prehandleEvent(e);
					affecting.keyup(e);
				}
			}
		});
	});

	return m;

})();

(function(iview) {

	iview.Canvas = function(id) {
		this.rotationMatrix = mat4.identity([]);
		this.translationMatrix = mat4.identity([]);
		this.id = id;
		var jqCapsule = $('#' + id);
		this.width = jqCapsule.attr('width');
		this.height = jqCapsule.attr('height');
		this.specs = new iview.VisualSpecifications();
		// setup input events
		// make sure prehandle events are only in if statements if handled, so
		// as not to block browser events
		var me = this;
		jqCapsule.click(function(e) {
			switch (e.which) {
			case 1:
				// left mouse button pressed
				if (me.click) {
					me.prehandleEvent(e);
					me.click(e);
				}
				break;
			case 2:
				// middle mouse button pressed
				if (me.middleclick) {
					me.prehandleEvent(e);
					me.middleclick(e);
				}
				break;
			case 3:
				// right mouse button pressed
				if (me.rightclick) {
					me.prehandleEvent(e);
					me.rightclick(e);
				}
				break;
			}
		});
		jqCapsule.dblclick(function(e) {
			if (me.dblclick) {
				me.prehandleEvent(e);
				me.dblclick(e);
			}
		});
		jqCapsule.mousedown(function(e) {
			switch (e.which) {
			case 1:
				// left mouse button pressed
				iview.monitor.CANVAS_DRAGGING = me;
				if (me.mousedown) {
					me.prehandleEvent(e);
					me.mousedown(e);
				}
				break;
			case 2:
				// middle mouse button pressed
				if (me.middlemousedown) {
					me.prehandleEvent(e);
					me.middlemousedown(e);
				}
				break;
			case 3:
				// right mouse button pressed
				if (me.rightmousedown) {
					me.prehandleEvent(e);
					me.rightmousedown(e);
				}
				break;
			}
		});
		jqCapsule.mousemove(function(e) {
			if (iview.monitor.CANVAS_DRAGGING == null && me.mousemove) {
				me.prehandleEvent(e);
				me.mousemove(e);
			}
		});
		jqCapsule.mouseout(function(e) {
			iview.monitor.CANVAS_OVER = null;
			if (me.mouseout) {
				me.prehandleEvent(e);
				me.mouseout(e);
			}
		});
		jqCapsule.mouseover(function(e) {
			iview.monitor.CANVAS_OVER = me;
			if (me.mouseover) {
				me.prehandleEvent(e);
				me.mouseover(e);
			}
		});
		jqCapsule.mouseup(function(e) {
			switch (e.which) {
			case 1:
				// left mouse button pressed
				if (me.mouseup) {
					me.prehandleEvent(e);
					me.mouseup(e);
				}
				break;
			case 2:
				// middle mouse button pressed
				if (me.middlemouseup) {
					me.prehandleEvent(e);
					me.middlemouseup(e);
				}
				break;
			case 3:
				// right mouse button pressed
				if (me.rightmouseup) {
					me.prehandleEvent(e);
					me.rightmouseup(e);
				}
				break;
			}
		});
		jqCapsule.mousewheel(function(e, delta) {
			if (me.mousewheel) {
				me.prehandleEvent(e);
				me.mousewheel(e, delta);
			}
		});
		var canvas = document.getElementById(this.id);
		this.gl = canvas.getContext('webgl');
		if (!this.gl) {
			this.gl = canvas.getContext('experimental-webgl');
		}
		this.gl.program = this.gl.createProgram();
		this.gl.shader = new iview.Shader(this.gl);
	};
	iview.Canvas.prototype.readPDB = function(content) {
		var molecule = new iview.Molecule();
		var resatoms = [];
		var atomSerials = [];
		var lines = content.split('\n');
		for ( var i = 0, ii = lines.length; i < ii; i++) {
			var line = lines[i];
			if (iview.stringStartsWith(line, 'ATOM')) {
				var a = new iview.Atom($.trim(line.substring(76, 78)), parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54)));
				a.hetatm = false;
				a.resSeq = parseInt(line.substring(22, 26));
				a.resName = $.trim(line.substring(17, 20));
				resatoms.push(a);
			} else if (iview.stringStartsWith(line, 'HETATM')) {
				var symbol = $.trim(line.substring(76, 78));
				if (symbol.length > 1) {
					symbol = symbol.substring(0, 1) + symbol.substring(1).toLowerCase();
				}
				var het = new iview.Atom(symbol, parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54)));
				het.hetatm = true;
				var residueName = $.trim(line.substring(17, 20));
				molecule.atoms.push(het);
				atomSerials[parseInt($.trim(line.substring(6, 11)))] = het;
			} else if (iview.stringStartsWith(line, 'TER')) {
				// start a new chain.
			} else if (iview.stringStartsWith(line, 'ENDMDL')) {
				break;
			}
		}
		if(molecule.bonds.length==0){
			for ( var i = 0, ii = molecule.atoms.length; i < ii; i++) {
				for ( var j = i + 1; j < ii; j++) {
					var first = molecule.atoms[i];
					var second = molecule.atoms[j];
					if (first.distance3D(second) < (iview.ELEMENT[first.label].covalentRadius + iview.ELEMENT[second.label].covalentRadius) * 1.1) {
						molecule.bonds.push(new iview.Bond(first, second, 1));
					}
				}
			}
		}
		molecule.atoms = molecule.atoms.concat(resatoms);
		return molecule;
	};
	iview.Canvas.prototype.loadMolecule = function(molecule) {
		this.molecule = molecule;
		var p = this.molecule.getCenter3D();
		for ( var i = 0, ii = this.molecule.atoms.length; i < ii; i++) {
			this.molecule.atoms[i].sub3D(p);
		}
		var d = this.molecule.getDimension();
		this.maxDimension = Math.max(d.x, d.y);
		this.translationMatrix = mat4.translate(mat4.identity([]), [ 0, 0, -this.maxDimension - 10 ]);
		// clear the canvas
		var cs = iview.getRGB(this.specs.backgroundColor);
		this.gl.clearColor(cs[0], cs[1], cs[2], 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		// here is the sphere buffer to be drawn, make it once, then scale
		// and translate to draw atoms
		this.gl.sphereBuffer = new iview.Sphere(1, this.specs.atoms_resolution_3D, this.specs.atoms_resolution_3D);
		this.gl.cylinderBuffer = new iview.Cylinder(1, 1, this.specs.bonds_resolution_3D);
		this.gl.lighting = new iview.Light('#FFFFFF', '#FFFFFF', [ -.1, -.1, -1 ], this.gl);
		this.gl.material = new iview.Material(this.gl);
		this.gl.projectionMatrix = mat4.perspective(45, this.width / this.height, .1, 10000);
		// push the projection matrix to the graphics card
		var pUniform = this.gl.getUniformLocation(this.gl.program, 'u_projection_matrix');
		this.gl.uniformMatrix4fv(pUniform, false, this.gl.projectionMatrix);
		// matrix setup functions
		var mvUL = this.gl.getUniformLocation(this.gl.program, 'u_model_view_matrix');
		var nUL = this.gl.getUniformLocation(this.gl.program, 'u_normal_matrix');
		this.gl.setMatrixUniforms = function(mvMatrix) {
			// push the model-view matrix to the graphics card
			this.uniformMatrix4fv(mvUL, false, mvMatrix);
			// create the normal matrix and push it to the graphics card
			var normalMatrix = mat3.transpose(mat4.toInverseMat3(mvMatrix, []));
			this.uniformMatrix3fv(nUL, false, normalMatrix);
		};
		this.repaint();
	};
	iview.Canvas.prototype.prehandleEvent = function(e) {
		e.preventDefault();
		e.offset = $('#' + this.id).offset();
		e.p = new iview.Point(e.pageX - e.offset.left, e.pageY - e.offset.top);
	};
	iview.Canvas.prototype.repaint = function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.modelViewMatrix = mat4.multiply(this.translationMatrix, this.rotationMatrix, []);
		this.gl.rotationMatrix = this.rotationMatrix;
		this.molecule.render(this.gl, this.specs);
		this.gl.flush();
	};
	iview.Canvas.prototype.mousedown = function(e) {
		this.lastPoint = e.p;
	};
	iview.Canvas.prototype.rightmousedown = function(e) {
		this.lastPoint = e.p;
	};
	iview.Canvas.prototype.drag = function(e) {
		if (iview.monitor.ALT) {
			var t = new iview.Point(e.p.x, e.p.y);
			t.sub(this.lastPoint);
			mat4.translate(this.translationMatrix, [ t.x / 20, -t.y / 20, 0 ]);
			this.lastPoint = e.p;
			this.repaint();
		} else {
			var difx = e.p.x - this.lastPoint.x;
			var dify = e.p.y - this.lastPoint.y;
			var rotation = mat4.rotate(mat4.identity([]), difx * Math.PI / 180.0, [ 0, 1, 0 ]);
			mat4.rotate(rotation, dify * Math.PI / 180.0, [ 1, 0, 0 ]);
			this.rotationMatrix = mat4.multiply(rotation, this.rotationMatrix);
			this.lastPoint = e.p;
			this.repaint();
		}
	};
	iview.Canvas.prototype.mousewheel = function(e, delta) {
		var dz = delta * this.maxDimension/8;
		mat4.translate(this.translationMatrix, [ 0, 0, dz ]);
		this.repaint();
	};

})(iview);
