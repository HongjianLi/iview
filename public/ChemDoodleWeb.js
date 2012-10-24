//
// ChemDoodle Web Components 4.7.0
//
// http://web.chemdoodle.com
//
// Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// As a special exception to the GPL, any HTML file in a public website
// or any free web service which merely makes function calls to this
// code, and for that purpose includes it by reference, shall be deemed
// a separate work for copyright law purposes. If you modify this code,
// you may extend this exception to your version of the code, but you
// are not obligated to do so. If you do not wish to do so, delete this
// exception statement from your version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// Please contact iChemLabs <http://www.ichemlabs.com/contact> for
// alternate licensing options.
//

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 2934 $
//  $Author: kevin $
//  $LastChangedDate: 2010-12-08 20:53:47 -0500 (Wed, 08 Dec 2010) $
//
var ChemDoodle = (function() {
	
	var c = {};

	c.structures = {};
	c.io = {};

	return c;
	
})();

//
//  Copyright 2006-2010 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3385 $
//  $Author: kevin $
//  $LastChangedDate: 2011-09-18 11:40:07 -0400 (Sun, 18 Sep 2011) $
//

ChemDoodle.extensions = (function(structures) {

	var ext = {};

	ext.stringStartsWith = function(str, match) {
		return str.match('^' + match) == match;
	};

	ext.vec3AngleFrom = function(v1, v2) {
		var length1 = vec3.length(v1);
		var length2 = vec3.length(v2);
		var dot = vec3.dot(v1, v2);
		var cosine = dot / length1 / length2;
		return Math.acos(cosine);
	};

	ext.contextHashTo = function(ctx, xs, ys, xt, yt, width, spacing) {
		var travelled = 0;
		var dist = new structures.Point(xs, ys).distance(new structures.Point(xt, yt));
		var space = false;
		var lastX = xs;
		var lastY = ys;
		var difX = xt - xs;
		var difY = yt - ys;
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

	return ext;

})(ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3519 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-02 20:59:30 -0400 (Wed, 02 May 2012) $
//

ChemDoodle.math = (function(extensions, structures) {

	var pack = {};

	pack.angleBetweenLargest = function(angles) {
		if (angles.length == 0) {
			return {
				angle : 0,
				largest : Math.PI * 2
			};
		}
		if (angles.length == 1) {
			return {
				angle : angles[0] + Math.PI,
				largest : Math.PI * 2
			};
		}
		var largest = 0;
		var angle = 0;
		var index = -1;
		for ( var i = 0, ii = angles.length - 1; i < ii; i++) {
			var dif = angles[i + 1] - angles[i];
			if (dif > largest) {
				largest = dif;
				angle = (angles[i + 1] + angles[i]) / 2;
				index = i;
			}
		}
		var last = angles[0] + Math.PI * 2 - angles[angles.length - 1];
		if (last > largest) {
			angle = angles[0] - last / 2;
			largest = last;
			if (angle < 0) {
				angle += Math.PI * 2;
			}
			index = angles.length - 1;
		}
		return {
			angle : angle,
			largest : largest
		};
	};

	pack.isBetween = function(x, left, right) {
		return x >= left && x <= right;
	};

	pack.getRGB = function(color) {
		var err = [ 0, 0, 0 ];
		if (color.charAt(0) == '#') {
			if (color.length == 4) {
				color = '#' + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
			}
			return [ parseInt(color.substring(1, 3), 16) / 255.0, parseInt(color.substring(3, 5), 16) / 255.0, parseInt(color.substring(5, 7), 16) / 255.0 ];
		} else if (extensions.stringStartsWith(color, 'rgb')) {
			var cs = color.replace(/rgb\(|\)/g, '').split(',');
			if (cs.length != 3) {
				return err;
			}
			return [ parseInt(cs[0]) / 255.0, parseInt(cs[1]) / 255.0, parseInt(cs[2]) / 255.0 ];
		}
		return err;
	};

	pack.calculateDistanceInterior = function(to, from, r) {
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

	pack.intersectLines = function(ax, ay, bx, by, cx, cy, dx, dy) {
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

	pack.hsl2rgb = function(h, s, l) {
		var r, g, b;
		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0)
					t += 1;
				if (t > 1)
					t -= 1;
				if (t < 1 / 6)
					return p + (q - p) * 6 * t;
				if (t < 1 / 2)
					return q;
				if (t < 2 / 3)
					return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return [ r * 255, g * 255, b * 255 ];
	};

	return pack;

})(ChemDoodle.extensions, ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3470 $
//  $Author: kevin $
//  $LastChangedDate: 2012-01-22 13:15:22 -0500 (Sun, 22 Jan 2012) $
//

ChemDoodle.ELEMENT = (function() {

	function Element(symbol, name, atomicNumber) {
		this.symbol = symbol;
		this.name = name;
		this.atomicNumber = atomicNumber;
		return true;
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
	E['H'].jmolColor = '#FFFFFF';
	E['C'].jmolColor = '#909090';
	E['N'].jmolColor = '#3050F8';
	E['O'].jmolColor = '#FF0D0D';
	E['F'].jmolColor = '#90E050';
	E['Na'].jmolColor = '#AB5CF2';
	E['Mg'].jmolColor = '#8AFF00';
	E['P'].jmolColor = '#FF8000';
	E['S'].jmolColor = '#FFFF30';
	E['Cl'].jmolColor = '#1FF01F';
	E['K'].jmolColor = '#8F40D4';
	E['Ca'].jmolColor = '#3DFF00';
	E['Mn'].jmolColor = '#9C7AC7';
	E['Fe'].jmolColor = '#E06633';
	E['Co'].jmolColor = '#F090A0';
	E['Ni'].jmolColor = '#50D050';
	E['Cu'].jmolColor = '#C88033';
	E['Zn'].jmolColor = '#7D80B0';
	E['As'].jmolColor = '#BD80E3';
	E['Se'].jmolColor = '#FFA100';
	E['Br'].jmolColor = '#A62929';
	E['Sr'].jmolColor = '#00FF00';
	E['Cd'].jmolColor = '#FFD98F';
	E['I'].jmolColor = '#940094';
	E['Hg'].jmolColor = '#B8B8D0';

/* Uncomment these lines to substitute PyMOL colors
	E['H'].jmolColor = '#E6E6E6';
	E['C'].jmolColor = '#33FF33';
	E['N'].jmolColor = '#3333FF';
	E['O'].jmolColor = '#FF4D4D';
	E['F'].jmolColor = '#B3FFFF';
	E['S'].jmolColor = '#E6C640';
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

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3008 $
//  $Author: kevin $
//  $LastChangedDate: 2011-01-07 21:28:00 -0500 (Fri, 07 Jan 2011) $
//
ChemDoodle.RESIDUE = (function() {

	function Residue(symbol, name) {
		this.symbol = symbol;
		this.name = name;
		return true;
	}

	var R = [];
	R['Ala'] = new Residue('Ala', 'Alanine');
	R['Arg'] = new Residue('Arg', 'Arginine');
	R['Asn'] = new Residue('Asn', 'Asparagine');
	R['Asp'] = new Residue('Asp', 'Aspartic Acid');
	R['Cys'] = new Residue('Cys', 'Cysteine');
	R['Gln'] = new Residue('Gln', 'Glutamine');
	R['Glu'] = new Residue('Glu', 'Glutamic Acid');
	R['Gly'] = new Residue('Gly', 'Glycine');
	R['His'] = new Residue('His', 'Histidine');
	R['Ile'] = new Residue('Ile', 'Isoleucine');
	R['Leu'] = new Residue('Leu', 'Leucine');
	R['Lys'] = new Residue('Lys', 'Lysine');
	R['Met'] = new Residue('Met', 'Methionine');
	R['Phe'] = new Residue('Phe', 'Phenylalanine');
	R['Pro'] = new Residue('Pro', 'Proline');
	R['Ser'] = new Residue('Ser', 'Serine');
	R['Thr'] = new Residue('Thr', 'Threonine');
	R['Trp'] = new Residue('Trp', 'Tryptophan');
	R['Tyr'] = new Residue('Tyr', 'Tyrosine');
	R['Val'] = new Residue('Val', 'Valine');
	R['Asx'] = new Residue('Asx', 'Asparagine');
	R['Glx'] = new Residue('Glx', 'Glutamine');
	R['*'] = new Residue('*', 'Other');

	return R;
	
})();

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3469 $
//  $Author: kevin $
//  $LastChangedDate: 2012-01-21 10:01:03 -0500 (Sat, 21 Jan 2012) $
//

(function(structures) {

	structures.Point = function(x, y) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
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
		return true;
	};

})(ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3519 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-02 20:59:30 -0400 (Wed, 02 May 2012) $
//

(function(ELEMENT, extensions, structures, m4) {

	structures.Atom = function(label, x, y, z) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.z = z ? z : 0;
		this.charge = 0;
		this.numLonePair = 0;
		this.mass = -1;
		this.coordinationNumber = 0;
		this.bondNumber = 0;
		this.angleOfLeastInterference = 0;
		this.isHidden = false;
		this.label = label ? label.replace(/\s/g, '') : 'C';
		this.altLabel = null;
		if (!ELEMENT[this.label]) {
			this.label = 'C';
		}
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
			ctx.fillStyle = ELEMENT[this.label].jmolColor;
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
					} else if (extensions.stringStartsWith(s, '-')) {
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
			if (this.specs) {
				specs = this.specs;
			}
			var transform = m4.translate(gl.modelViewMatrix, [ this.x, this.y, this.z ], []);
			var radius = specs.atoms_useVDWDiameters_3D ? ELEMENT[this.label].vdWRadius * specs.atoms_vdwMultiplier_3D : specs.atoms_sphereDiameter_3D / 2;
			if (radius == 0) {
				radius = 1;
			}
			m4.scale(transform, [ radius, radius, radius ]);
			// colors
			var color = ELEMENT[this.label].jmolColor;
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
			if (this.label == 'H' || ELEMENT[this.label] == null) {
				return 0;
			}
			var valence = ELEMENT[this.label].valency;
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
		return true;
	};
	structures.Atom.prototype = new structures.Point(0, 0);

})(ChemDoodle.ELEMENT, ChemDoodle.extensions, ChemDoodle.structures, mat4);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3519 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-02 20:59:30 -0400 (Wed, 02 May 2012) $
//

(function(ELEMENT, extensions, structures, math, m4, v3) {

	structures.Bond = function(a1, a2, bondOrder) {
		this.a1 = a1;
		this.a2 = a2;
		this.bondOrder = bondOrder ? bondOrder : 1;
		this.stereo = structures.Bond.STEREO_NONE;
		this.isHover = false;
		this.getCenter = function() {
			return new structures.Point((this.a1.x + this.a2.x) / 2, (this.a1.y + this.a2.y) / 2);
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
			if(this.specs){
				specs = this.specs;
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
					distShrink = Math.max(distShrink, math.calculateDistanceInterior(this.a1, this.a2, this.a1.textBounds[i]));
				}
				distShrink += specs.bonds_atomLabelBuffer_2D;
				var perc = distShrink / dist;
				x1 += difX * perc;
				y1 += difY * perc;
			}
			if (specs.atoms_display && !specs.atoms_circles_2D && this.a2.isLabelVisible(specs)) {
				var distShrink = 0;
				for(var i = 0, ii = this.a2.textBounds.length; i<ii; i++){
					distShrink = Math.max(distShrink, math.calculateDistanceInterior(this.a2, this.a1, this.a2.textBounds[i]));
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
			var color1 = ELEMENT[this.a1.label].jmolColor;
			var color2 = ELEMENT[this.a2.label].jmolColor;
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
				extensions.contextHashTo(ctx, x1, y1, x2, y2, specs.bonds_hashSpacing_2D, specs.bonds_hashSpacing_2D);
				ctx.stroke();
				break;
			case 1:
				if (this.stereo == structures.Bond.STEREO_PROTRUDING || this.stereo == structures.Bond.STEREO_RECESSED) {
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
					if (this.stereo == structures.Bond.STEREO_PROTRUDING) {
						ctx.fill();
					} else {
						ctx.save();
						ctx.clip();
						ctx.lineWidth = useDist * 2;
						ctx.lineCap = 'butt';
						ctx.beginPath();
						ctx.moveTo(x1, y1);
						extensions.contextHashTo(ctx, x1, y1, x2, y2, specs.bonds_hashWidth_2D, specs.bonds_hashSpacing_2D);
						ctx.stroke();
						ctx.restore();
					}
				} else if (this.stereo == structures.Bond.STEREO_AMBIGUOUS) {
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
				if (this.stereo == structures.Bond.STEREO_AMBIGUOUS) {
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
			if(this.specs){
				specs = this.specs;
			}
			// this is the elongation vector for the cylinder
			var height = (specs.bonds_renderAsLines_3D?1.1:1.001) * this.a1.distance3D(this.a2) / 2;
			if (height == 0) {
				// if there is no height, then no point in rendering this bond,
				// just return
				return false;
			}
			var scaleVector = [ specs.bonds_cylinderDiameter_3D / 2, height, specs.bonds_cylinderDiameter_3D / 2 ];
			// transform to the atom as well as the opposite atom
			var transform = m4.translate(gl.modelViewMatrix, [ this.a1.x, this.a1.y, this.a1.z ], []);
			var transformOpposite = null;
			// align bond
			var a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
			v3.scale(a2b, .5);
			transformOpposite = m4.translate(gl.modelViewMatrix, [ this.a2.x, this.a2.y, this.a2.z ], []);
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
					var inverse = m4.inverse(gl.rotationMatrix, []);
					m4.multiplyVec3(inverse, z);
					saturatedCross = v3.cross(a2b, z, []);
					v3.normalize(saturatedCross);
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
				ang = extensions.vec3AngleFrom(y, a2b);
				axis = v3.cross(y, a2b, []);
			}
			// render bonds
			for ( var i = 0, ii = others.length; i < ii; i++) {
				var transformUse = m4.set(transform, []);
				if (others[i] != 0) {
					m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
				}
				if (ang != 0) {
					m4.rotate(transformUse, ang, axis);
				}
				m4.scale(transformUse, scaleVector);
				// colors
				var color = ELEMENT[this.a1.label].jmolColor;
				gl.material.setDiffuseColor(color);
				// render
				gl.setMatrixUniforms(transformUse);
				if (specs.bonds_renderAsLines_3D) {
					gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
				}else {
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
				}
				m4.set(transformOpposite, transformUse);
				if (others[i] != 0) {
					m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
				}
				// don't check for 0 here as that means it should be rotated
				// by PI, but PI will be negated
				m4.rotate(transformUse, ang + Math.PI, axis);
				m4.scale(transformUse, scaleVector);
				// colors
				gl.material.setDiffuseColor(ELEMENT[this.a2.label].jmolColor);
				// render
				gl.setMatrixUniforms(transformUse);				
				if (specs.bonds_renderAsLines_3D) {
					gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
				}else {
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
				}
			}
		};
		return true;
	};
	structures.Bond.STEREO_NONE = 'none';
	structures.Bond.STEREO_PROTRUDING = 'protruding';
	structures.Bond.STEREO_RECESSED = 'recessed';
	structures.Bond.STEREO_AMBIGUOUS = 'ambiguous';

})(ChemDoodle.ELEMENT, ChemDoodle.extensions, ChemDoodle.structures, ChemDoodle.math, mat4, vec3);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3519 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-02 20:59:30 -0400 (Wed, 02 May 2012) $
//

(function(c, math, structures, RESIDUE) {

	structures.Molecule = function() {
		this.atoms = [];
		this.bonds = [];
		this.draw = function(ctx, specs) {
			if (this.specs) {
				specs = this.specs;
			}
			// draw
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
			if (this.specs) {
				specs = this.specs;
			}
			var isMacro = this.atoms.length > 0 && this.atoms[0].hetatm != undefined;
			if (isMacro) {
				if (specs.macro_displayBonds) {
					if (this.bonds.length > 0) {
						if (specs.bonds_renderAsLines_3D && !this.residueSpecs || this.residueSpecs && this.residueSpecs.bonds_renderAsLines_3D) {
							gl.lineWidth(this.residueSpecs ? this.residueSpecs.bonds_width_2D : specs.bonds_width_2D);
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
							b.render(gl, this.residueSpecs ? this.residueSpecs : specs);
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
							a.render(gl, this.residueSpecs ? this.residueSpecs : specs);
						}
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
					if (!isMacro || b.a1.hetatm) {
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
					if (!isMacro || (a.hetatm && !a.isWater)) {
						a.render(gl, specs);
					}
				}
			}
			if (this.chains) {
				// set up the model view matrix, since it won't be modified
				// for macromolecules
				gl.setMatrixUniforms(gl.modelViewMatrix);
				// render chains
				if (specs.proteins_displayRibbon) {
					// proteins
					// colors
					gl.material.setTempColors(specs.proteins_materialAmbientColor_3D, null, specs.proteins_materialSpecularColor_3D, specs.proteins_materialShininess_3D);
					for ( var j = 0, jj = this.ribbons.length; j < jj; j++) {
						var use = this.cartoons[j];
						use.front.bindBuffers(gl);
						for ( var i = 0, ii = use.front.cartoonSegments.length; i < ii; i++) {
							use.front.cartoonSegments[i].render(gl, specs);
						}
						use.back.bindBuffers(gl);
						for ( var i = 0, ii = use.back.cartoonSegments.length; i < ii; i++) {
							use.back.cartoonSegments[i].render(gl, specs);
						}
					}
				}
			}
		};
		this.getCenter3D = function() {
			if (this.atoms.length == 1) {
				return new structures.Atom('C', this.atoms[0].x, this.atoms[0].y, this.atoms[0].z);
			}
			var minX = minY = minZ = Infinity;
			var maxX = maxY = maxZ = -Infinity;
			if (this.chains) {
				// residues
				for ( var i = 0, ii = this.chains.length; i < ii; i++) {
					var chain = this.chains[i];
					for ( var j = 0, jj = chain.length; j < jj; j++) {
						var residue = chain[j];
						minX = Math.min(residue.cp1.x, minX);
						minY = Math.min(residue.cp1.y, minY);
						minZ = Math.min(residue.cp1.z, minZ);
						maxX = Math.max(residue.cp1.x, maxX);
						maxY = Math.max(residue.cp1.y, maxY);
						maxZ = Math.max(residue.cp1.z, maxZ);
						minX = Math.min(residue.cp2.x, minX);
						minY = Math.min(residue.cp2.y, minY);
						minZ = Math.min(residue.cp2.z, minZ);
						maxX = Math.max(residue.cp2.x, maxX);
						maxY = Math.max(residue.cp2.y, maxY);
						maxZ = Math.max(residue.cp2.z, maxZ);
					}
				}
			}
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				minZ = Math.min(this.atoms[i].z, minZ);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
				maxZ = Math.max(this.atoms[i].z, maxZ);
			}
			return new structures.Atom('C', (maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
		};
		this.getCenter = function() {
			if (this.atoms.length == 1) {
				return new structures.Point(this.atoms[0].x, this.atoms[0].y);
			}
			var minX = minY = Infinity;
			var maxX = maxY = -Infinity;
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
			}
			return new structures.Point((maxX + minX) / 2, (maxY + minY) / 2);
		};
		this.getDimension = function() {
			if (this.atoms.length == 1) {
				return new structures.Point(0, 0);
			}
			var minX = minY = Infinity;
			var maxX = maxY = -Infinity;
			if (this.chains) {
				for ( var i = 0, ii = this.chains.length; i < ii; i++) {
					var chain = this.chains[i];
					for ( var j = 0, jj = chain.length; j < jj; j++) {
						var residue = chain[j];
						minX = Math.min(residue.cp1.x, minX);
						minY = Math.min(residue.cp1.y, minY);
						maxX = Math.max(residue.cp1.x, maxX);
						maxY = Math.max(residue.cp1.y, maxY);
						minX = Math.min(residue.cp2.x, minX);
						minY = Math.min(residue.cp2.y, minY);
						maxX = Math.max(residue.cp2.x, maxX);
						maxY = Math.max(residue.cp2.y, maxY);
					}
				}
				minX -= 30;
				minY -= 30;
				minZ -= 30;
				maxX += 30;
				maxY += 30;
				maxZ += 30;
			}
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
			}
			return new structures.Point(maxX - minX, maxY - minY);
		};
		return true;
	};

})(ChemDoodle, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.RESIDUE);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3078 $
//  $Author: kevin $
//  $LastChangedDate: 2011-02-06 18:27:15 -0500 (Sun, 06 Feb 2011) $
//

(function(structures, m4, v3) {
	
	var SB = null;
	var lastVerticalResolution = -1;
	
	function setupMatrices(verticalResolution){
		var n2 = verticalResolution*verticalResolution;
		var n3 = verticalResolution*verticalResolution*verticalResolution;
		var S = [ 6 / n3, 0, 0, 0, 6 / n3, 2 / n2, 0, 0, 1 / n3, 1 / n2, 1 / verticalResolution, 0, 0, 0, 0, 1 ];
		var Bm = [ -1 / 6, 1 / 2, -1 / 2, 1 / 6, 1 / 2, -1, 1 / 2, 0, -1 / 2, 0, 1 / 2, 0, 1 / 6, 2 / 3, 1 / 6, 0 ];
		SB = m4.multiply(Bm, S, []);
		lastVerticalResolution = verticalResolution;
	};

	structures.Residue = function(resSeq) {
		// number of vertical slashes per segment
		this.resSeq = resSeq;
		this.setup = function(nextAlpha, horizontalResolution){
			this.horizontalResolution = horizontalResolution;
			// define plane
			var A = [ nextAlpha.x - this.cp1.x, nextAlpha.y - this.cp1.y, nextAlpha.z - this.cp1.z ];
			var B = [ this.cp2.x - this.cp1.x, this.cp2.y - this.cp1.y, this.cp2.z - this.cp1.z ];
			var C = v3.cross(A, B, []);
			this.D = v3.cross(C, A, []);
			v3.normalize(C);
			v3.normalize(this.D);
			// generate guide coordinates
			// guides for the narrow parts of the ribbons
			this.guidePointsSmall = [];
			// guides for the wide parts of the ribbons
			this.guidePointsLarge = [];
			var P = [ (nextAlpha.x + this.cp1.x) / 2, (nextAlpha.y + this.cp1.y) / 2, (nextAlpha.z + this.cp1.z) / 2 ];
			if (this.helix) {
				// expand helices
				v3.scale(C, 1.5);
				v3.add(P, C);
			}
			this.guidePointsSmall[0] = new structures.Atom('', P[0] - this.D[0] / 2, P[1] - this.D[1] / 2, P[2] - this.D[2] / 2);
			for ( var i = 1; i < horizontalResolution; i++) {
				this.guidePointsSmall[i] = new structures.Atom('', this.guidePointsSmall[0].x + this.D[0] * i / horizontalResolution, this.guidePointsSmall[0].y + this.D[1] * i / horizontalResolution, this.guidePointsSmall[0].z + this.D[2] * i / horizontalResolution);
			}
			v3.scale(this.D, 4);
			this.guidePointsLarge[0] = new structures.Atom('', P[0] - this.D[0] / 2, P[1] - this.D[1] / 2, P[2] - this.D[2] / 2);
			for ( var i = 1; i < horizontalResolution; i++) {
				this.guidePointsLarge[i] = new structures.Atom('', this.guidePointsLarge[0].x + this.D[0] * i / horizontalResolution, this.guidePointsLarge[0].y + this.D[1] * i / horizontalResolution, this.guidePointsLarge[0].z + this.D[2] * i / horizontalResolution);
			}
		};
		this.getGuidePointSet = function(type) {
			if (type == 0) {
				return this.helix || this.sheet ? this.guidePointsLarge : this.guidePointsSmall;
			} else if (type == 1) {
				return this.guidePointsSmall;
			} else if (type == 2) {
				return this.guidePointsLarge;
			}
		};
		this.computeLineSegments = function(b1, a3, a4, doCartoon, verticalResolution) {
			if(verticalResolution!=lastVerticalResolution){
				setupMatrices(verticalResolution);
			}
			this.split = a3.helix != this.helix || a3.sheet != this.sheet;
			this.lineSegments = this.innerCompute(0, b1, a3, a4, false, verticalResolution);
			if(doCartoon){
				this.lineSegmentsCartoon = this.innerCompute(a3.helix || a3.sheet ? 2 : 1, b1, a3, a4, true, verticalResolution);
			}
		};
		this.innerCompute = function(set, b1, a3, a4, useArrows, verticalResolution) {
			var segments = [];
			var use = this.getGuidePointSet(set);
			var useb1 = b1.getGuidePointSet(set);
			var usea3 = a3.getGuidePointSet(set);
			var usea4 = a4.getGuidePointSet(set);
			for ( var l = 0, ll = this.guidePointsLarge.length; l < ll; l++) {
				var G = [ useb1[l].x, useb1[l].y, useb1[l].z, 1, use[l].x, use[l].y, use[l].z, 1, usea3[l].x, usea3[l].y, usea3[l].z, 1, usea4[l].x, usea4[l].y, usea4[l].z, 1 ];
				var M = m4.multiply(G, SB, []);
				var strand = [];
				for ( var k = 0; k < verticalResolution; k++) {
					for ( var i = 3; i > 0; i--) {
						for ( var j = 0; j < 4; j++) {
							M[i * 4 + j] += M[(i - 1) * 4 + j];
						}
					}
					strand[k] = new structures.Atom('', M[12] / M[15], M[13] / M[15], M[14] / M[15]);
				}
				segments[l] = strand;
			}
			if (useArrows && this.arrow) {
				for ( var i = 0, ii = verticalResolution; i < ii; i++) {
					var mult = 1.5 - 1.3 * i / verticalResolution;
					var mid = Math.floor(this.horizontalResolution / 2);
					var center = segments[mid];
					for ( var j = 0, jj = segments.length; j < jj; j++) {
						if (j != mid) {
							var o = center[i];
							var f = segments[j][i];
							var vec = [ f.x - o.x, f.y - o.y, f.z - o.z ];
							v3.scale(vec, mult);
							f.x = o.x + vec[0];
							f.y = o.y + vec[1];
							f.z = o.z + vec[2];
						}
					}
				}
			}
			return segments;
		};
	};

})(ChemDoodle.structures, mat4, vec3);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3385 $
//  $Author: kevin $
//  $LastChangedDate: 2011-09-18 11:40:07 -0400 (Sun, 18 Sep 2011) $
//

(function(structures) {

	structures._Mesh = function() {
		return true;
	};
	structures._Mesh.prototype.storeData = function(positionData, normalData, indexData) {
		this.positionData = positionData;
		this.normalData = normalData;
		this.indexData = indexData;
	};
	structures._Mesh.prototype.setupBuffers = function(gl) {
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
	structures._Mesh.prototype.generateBuffers = function(gl, positionData, normalData, indexData) {
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
	structures._Mesh.prototype.bindBuffers = function(gl) {
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

})(ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3462 $
//  $Author: kevin $
//  $LastChangedDate: 2012-01-05 15:33:29 -0500 (Thu, 05 Jan 2012) $
//

(function(structures) {

	structures.Cylinder = function(radius, height, bands) {
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
		
		return true;
	};
	structures.Cylinder.prototype = new structures._Mesh();

})(ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3462 $
//  $Author: kevin $
//  $LastChangedDate: 2012-01-05 15:33:29 -0500 (Thu, 05 Jan 2012) $
//

(function(structures) {

	structures.Sphere = function(radius, latitudeBands, longitudeBands) {
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
		
		return true;
	};
	structures.Sphere.prototype = new structures._Mesh();

})(ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3078 $
//  $Author: kevin $
//  $LastChangedDate: 2011-02-06 18:27:15 -0500 (Sun, 06 Feb 2011) $
//

(function(RESIDUE, structures, v3) {

	var loadPartition = function(gl, p) {
		// positions
		gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexPositionBuffer);
		gl.vertexAttribPointer(gl.shader.vertexPositionAttribute, p.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		// normals
		gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexNormalBuffer);
		gl.vertexAttribPointer(gl.shader.vertexNormalAttribute, p.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		// indexes
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.vertexIndexBuffer);
	};

	function SubRibbon(entire, name, indexes, pi) {
		this.name = name;
		this.entire = entire;
		this.pi = pi;

		this.getColor = function(specs) {
			if (this.name) {
				return this.getResidueColor(RESIDUE[this.name] ? this.name : '*', specs);
			} else if (this.helix) {
				return entire.front ? specs.proteins_ribbonCartoonHelixPrimaryColor : specs.proteins_ribbonCartoonHelixSecondaryColor;
			} else if (this.sheet) {
				return specs.proteins_ribbonCartoonSheetColor;
			} else {
				return entire.front ? specs.proteins_primaryColor : specs.proteins_secondaryColor;
			}
		};
		this.getResidueColor = function(name, specs) {
			return '#FFFFFF';
		};
		this.render = function(gl, specs) {
			if (this.entire.partitions != null && this.pi != this.entire.partitions.lastRender) {
				loadPartition(gl, this.entire.partitions[this.pi]);
				this.entire.partitions.lastRender = this.pi;
			}
			if (!this.vertexIndexBuffer) {
				this.vertexIndexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
				this.vertexIndexBuffer.itemSize = 1;
				this.vertexIndexBuffer.numItems = indexes.length;
			}
			// indexes
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
			// colors
			gl.material.setDiffuseColor(this.getColor(specs));
			// render
			gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		};
	}

	structures.Ribbon = function(chain, offset, cartoon) {
		// ribbon meshes build front to back, not side to side, so keep this in
		// mind
		var lineSegmentNum = chain[0].lineSegments.length;
		var lineSegmentLength = chain[0].lineSegments[0].length;
		this.partitions = [];
		this.partitions.lastRender = 0;
		var currentPartition = null;
		this.front = offset > 0;
		// calculate vertex and normal points
		for ( var i = 0, ii = chain.length - 1; i < ii; i++) {
			if (currentPartition == null || currentPartition.positionData.length > 65000) {
				if (this.partitions.length > 0) {
					i--;
				}
				currentPartition = {
					count : 0,
					positionData : [],
					normalData : [],
					indexData : []
				};
				this.partitions.push(currentPartition);
			}
			var residue = chain[i];
			currentPartition.count++;
			for ( var j = 0; j < lineSegmentNum; j++) {
				var lineSegment = cartoon ? residue.lineSegmentsCartoon[j] : residue.lineSegments[j];
				var doSide1 = j == 0;
				var doSide2 = false;
				for ( var k = 0; k < lineSegmentLength; k++) {
					var a = lineSegment[k];
					// normals
					var abovei = i;
					var abovek = k + 1;
					if (i == chain.length - 2 && k == lineSegmentLength - 1) {
						abovek--;
					} else if (k == lineSegmentLength - 1) {
						abovei++;
						abovek = 0;
					}
					var above = cartoon ? chain[abovei].lineSegmentsCartoon[j][abovek] : chain[abovei].lineSegments[j][abovek];
					var negate = false;
					var nextj = j + 1;
					if (j == lineSegmentNum - 1) {
						nextj -= 2;
						negate = true;
					}
					var side = cartoon ? residue.lineSegmentsCartoon[nextj][k] : residue.lineSegments[nextj][k];
					var toAbove = [ above.x - a.x, above.y - a.y, above.z - a.z ];
					var toSide = [ side.x - a.x, side.y - a.y, side.z - a.z ];
					var normal = v3.cross(toAbove, toSide, []);
					// positions
					if (k == 0) {
						// tip
						v3.normalize(toAbove);
						v3.scale(toAbove, -1);
						currentPartition.normalData.push(toAbove[0], toAbove[1], toAbove[2]);
						currentPartition.positionData.push(a.x, a.y, a.z);
					}
					if (doSide1 || doSide2) {
						// sides
						v3.normalize(toSide);
						v3.scale(toSide, -1);
						currentPartition.normalData.push(toSide[0], toSide[1], toSide[2]);
						currentPartition.positionData.push(a.x, a.y, a.z);
						if (doSide1 && k == lineSegmentLength - 1) {
							doSide1 = false;
							k = -1;
						}
					} else {
						// center strips
						v3.normalize(normal);
						if (negate && !this.front || !negate && this.front) {
							v3.scale(normal, -1);
						}
						currentPartition.normalData.push(normal[0], normal[1], normal[2]);
						v3.scale(normal, Math.abs(offset));
						currentPartition.positionData.push(a.x + normal[0], a.y + normal[1], a.z + normal[2]);
						if (j == lineSegmentNum - 1 && k == lineSegmentLength - 1) {
							doSide2 = true;
							k = -1;
						}
					}
					if (k == -1 || k == lineSegmentLength - 1) {
						// end
						v3.normalize(toAbove);
						currentPartition.normalData.push(toAbove[0], toAbove[1], toAbove[2]);
						currentPartition.positionData.push(a.x, a.y, a.z);
					}
				}
			}
		}

		// build mesh connectivity
		// add 2 to lineSegmentNum and lineSegmentLength to account for sides
		// and ends
		lineSegmentNum += 2;
		lineSegmentLength += 2;
		if (cartoon) {
			this.cartoonSegments = [];
		}
		this.segments = [];
		for ( var n = 0, nn = this.partitions.length; n < nn; n++) {
			var currentPartition = this.partitions[n];
			var cartoonSegmentIndexData = null;
			if (cartoon) {
				cartoonSegmentIndexData = [];
			}
			for ( var i = 0, ii = currentPartition.count - 1; i < ii; i++) {
				var chainIndex = i;
				for ( var j = 0; j < n; j++) {
					chainIndex += this.partitions[j].count - 1;
				}
				var c = chain[chainIndex];
				if (i > 0 && cartoon && c.split) {
					var sr = new SubRibbon(this, null, cartoonSegmentIndexData, n);
					if (c.helix) {
						sr.helix = true;
					}
					if (c.sheet) {
						sr.sheet = true;
					}
					this.cartoonSegments.push(sr);
					cartoonSegmentIndexData = [];
				}
				var residueIndexStart = i * lineSegmentNum * lineSegmentLength;
				var individualIndexData = [];
				for ( var j = 0, jj = lineSegmentNum - 1; j < jj; j++) {
					var segmentIndexStart = residueIndexStart + j * lineSegmentLength;
					for ( var k = 0; k < lineSegmentLength; k++) {
						var nextRes = 1;
						if (i == currentPartition.count - 1) {
							nextRes = 0;
						} else if (k == lineSegmentLength - 1) {
							nextRes = lineSegmentNum * lineSegmentLength - k;
						}
						var add = [ segmentIndexStart + k, segmentIndexStart + lineSegmentLength + k, segmentIndexStart + lineSegmentLength + k + nextRes, segmentIndexStart + k, segmentIndexStart + k + nextRes, segmentIndexStart + lineSegmentLength + k + nextRes ];
						if (k != lineSegmentLength - 1) {
							for ( var l = 0; l < 6; l++) {
								individualIndexData.push(add[l]);
							}
						}
						if (k == lineSegmentLength - 2 && i < currentPartition.count - 1) {
							// jump the gap, the other mesh points will be
							// covered,
							// so no need to explicitly skip them
							var jump = lineSegmentNum * lineSegmentLength - k;
							add[2] += jump;
							add[4] += jump;
							add[5] += jump;
						}
						for ( var l = 0; l < 6; l++) {
							currentPartition.indexData.push(add[l]);
						}
						if (cartoon) {
							for ( var l = 0; l < 6; l++) {
								cartoonSegmentIndexData.push(add[l]);
							}
						}
					}
				}
				var resName = chain[chainIndex + 1].name;
				this.segments.push(new SubRibbon(this, resName, individualIndexData, n));
			}
			if (cartoon) {
				var sr = new SubRibbon(this, null, cartoonSegmentIndexData, n);
				var chainIndex = currentPartition.count-1;
				for ( var j = 0; j < n; j++) {
					chainIndex += this.partitions[j].count - 1;
				}
				var c = chain[chainIndex];
				if (c.helix) {
					sr.helix = true;
				}
				if (c.sheet) {
					sr.sheet = true;
				}
				this.cartoonSegments.push(sr);
			}
		}

		this.storeData(this.partitions[0].positionData, this.partitions[0].normalData, this.partitions[0].indexData);
		if (this.partitions.length == 1) {
			// clear partitions to reduce overhead
			this.partitions = null;
		}

		this.render = function(gl, specs) {
			this.bindBuffers(gl);
			// colors
			var color = this.front ? specs.proteins_primaryColor : specs.proteins_secondaryColor;
			gl.material.setDiffuseColor(color);
			// render
			gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			if (this.partitions) {
				for ( var i = 1, ii = this.partitions.length; i < ii; i++) {
					var p = this.partitions[i];
					loadPartition(gl, p);
					// render
					gl.drawElements(gl.TRIANGLES, p.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
				}
			}
		};

		return true;
	};
	structures.Ribbon.prototype = new structures._Mesh();

})(ChemDoodle.RESIDUE, ChemDoodle.structures, vec3);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3385 $
//  $Author: kevin $
//  $LastChangedDate: 2011-09-18 11:40:07 -0400 (Sun, 18 Sep 2011) $
//

(function(math, structures, v3) {

	structures.Light = function(diffuseColor, specularColor, direction) {
		this.diffuseRGB = math.getRGB(diffuseColor);
		this.specularRGB = math.getRGB(specularColor);
		this.direction = direction;
		this.lightScene = function(gl) {
			var prefix = 'u_light.';
			gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'diffuse_color'), this.diffuseRGB[0], this.diffuseRGB[1], this.diffuseRGB[2]);
			gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'specular_color'), this.specularRGB[0], this.specularRGB[1], this.specularRGB[2]);

			var lightingDirection = v3.create(this.direction);
			v3.normalize(lightingDirection);
			v3.negate(lightingDirection);
			gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'direction'), lightingDirection[0], lightingDirection[1], lightingDirection[2]);

			// compute the half vector
			var eyeVector = [ 0, 0, 0 ];
			var halfVector = [ eyeVector[0] + lightingDirection[0], eyeVector[1] + lightingDirection[1], eyeVector[2] + lightingDirection[2] ];
			var length = v3.length(halfVector);
			if (length == 0)
				halfVector = [ 0, 0, 1 ];
			else {
				v3.scale(1 / length);
			}
			gl.uniform3f(gl.getUniformLocation(gl.program, prefix + 'half_vector'), halfVector[0], halfVector[1], halfVector[2]);
		};
		return true;
	};

})(ChemDoodle.math, ChemDoodle.structures, vec3);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3100 $
//  $Author: kevin $
//  $LastChangedDate: 2011-02-17 07:35:56 -0500 (Thu, 17 Feb 2011) $
//

(function(structures) {

	structures.Line = function() {
		this.storeData([0,0,0, 0,1,0], [0,0,0, 0,0,0]);
		return true;
	};
	structures.Line.prototype = new structures._Mesh();

})(ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3462 $
//  $Author: kevin $
//  $LastChangedDate: 2012-01-05 15:33:29 -0500 (Thu, 05 Jan 2012) $
//

(function(math, structures) {

	structures.Material = function(gl) {
		var prefix = 'u_material.';
		var aUL = gl.getUniformLocation(gl.program, prefix + 'ambient_color');
		var dUL = gl.getUniformLocation(gl.program, prefix + 'diffuse_color');
		var sUL = gl.getUniformLocation(gl.program, prefix + 'specular_color');
		var snUL = gl.getUniformLocation(gl.program, prefix + 'shininess');
		var alUL = gl.getUniformLocation(gl.program, prefix + 'alpha');
		this.setTempColors = function(ambientColor, diffuseColor, specularColor, shininess) {
			if(!this.aCache || this.aCache!=ambientColor){
				this.aCache = ambientColor;
				var cs = math.getRGB(ambientColor);
				gl.uniform3f(aUL, cs[0], cs[1], cs[2]);
			}
			if(diffuseColor!=null && (!this.dCache || this.dCache!=diffuseColor)){
				this.dCache = diffuseColor;
				var cs = math.getRGB(diffuseColor);
				gl.uniform3f(dUL, cs[0], cs[1], cs[2]);
			}
			if(!this.sCache || this.sCache!=specularColor){
				this.sCache = specularColor;
				var cs = math.getRGB(specularColor);
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
				var cs = math.getRGB(diffuseColor);
				gl.uniform3f(dUL, cs[0], cs[1], cs[2]);
			}
		};
		this.setAlpha = function(alpha) {
			if(!this.alCache || this.alCache!=alpha){
				this.alCache = alpha;
				gl.uniform1f(alUL, alpha);
			}
		};
		return true;
	};

})(ChemDoodle.math, ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3462 $
//  $Author: kevin $
//  $LastChangedDate: 2012-01-05 15:33:29 -0500 (Thu, 05 Jan 2012) $
//

(function(structures) {

	structures.Shader = function(gl) {
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

		return true;
	};

})(ChemDoodle.structures);
//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3524 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-04 22:27:39 -0400 (Fri, 04 May 2012) $
//

(function(c, structures) {

	structures.VisualSpecifications = function() {

		// canvas properties
		this.backgroundColor = '#FFFFFF';
		this.scale = 1;
		this.rotateAngle = 0;
		this.bondLength = 20;
		this.angstromsPerBondLength = 1.25;
		this.lightDirection_3D = [ -.1, -.1, -1 ];
		this.lightDiffuseColor_3D = '#FFFFFF';
		this.lightSpecularColor_3D = '#FFFFFF';
		this.projectionPerspectiveVerticalFieldOfView_3D = 45;
		this.projectionFrontCulling_3D = .1;
		this.projectionBackCulling_3D = 10000;

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
		this.proteins_displayRibbon = true;
		this.proteins_displayBackbone = false;
		this.proteins_backboneThickness = 1.5;
		this.proteins_backboneColor = '#CCCCCC';
		this.proteins_primaryColor = '#FF0D0D';
		this.proteins_secondaryColor = '#FFFF30';
		this.proteins_ribbonCartoonHelixPrimaryColor = '#00E740';
		this.proteins_ribbonCartoonHelixSecondaryColor = '#9905FF';
		this.proteins_ribbonCartoonSheetColor = '#E8BB99';
		this.proteins_ribbonThickness = .2;
		this.proteins_verticalResolution = 10;
		this.proteins_horizontalResolution = 9;
		this.proteins_materialAmbientColor_3D = '#222222';
		this.proteins_materialSpecularColor_3D = '#555555';
		this.proteins_materialShininess_3D = 32;
		this.nucleics_display = true;
		this.nucleics_baseColor = '#C10000';
		this.nucleics_useShapelyColors = true;
		this.nucleics_verticalResolution = 10;
		this.nucleics_materialAmbientColor_3D = '#222222';
		this.nucleics_materialSpecularColor_3D = '#555555';
		this.nucleics_materialShininess_3D = 32;
		this.macro_displayAtoms = false;
		this.macro_displayBonds = false;
		this.macro_atomToLigandDistance = -1;

/*
Ball and Stick
		this.atoms_vdwMultiplier_3D = .3;
		this.bonds_useJMOLColors = false;
		this.bonds_cylinderDiameter_3D = .3;
		this.bonds_materialAmbientColor_3D = c.default_atoms_materialAmbientColor_3D;
van der Waals Spheres
		this.bonds_display = false;
		this.atoms_vdwMultiplier_3D = 1;
Wireframe
		this.atoms_useVDWDiameters_3D = false;
		this.bonds_cylinderDiameter_3D = .05;
		this.atoms_sphereDiameter_3D = .15;
		this.bonds_materialAmbientColor_3D = c.default_atoms_materialAmbientColor_3D;
Line
		this.atoms_display = false;
		this.bonds_renderAsLines_3D = true;
		this.bonds_width_2D = 1;
		this.bonds_cylinderDiameter_3D = .05;
*/
		
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

})(ChemDoodle, ChemDoodle.structures);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3526 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-05 15:12:11 -0400 (Sat, 05 May 2012) $
//

(function(c, extensions, io, structures, ELEMENT) {

	io.PDBInterpreter = function() {

		this.calculateRibbonDistances = false;
		this.deduceResidueBonds = false;

		function checkContained(residue, set, chainID, index, helix) {
			for ( var j = 0, jj = set.length; j < jj; j++) {
				var check = set[j];
				if (check.id == chainID && index >= check.start && index <= check.end) {
					if (helix) {
						residue.helix = true;
					} else {
						residue.sheet = true;
					}
					if (index + 1 == check.end) {
						residue.arrow = true;
					}
					return;
				}
			}
		}

		this.read = function(content) {
			var molecule = new structures.Molecule();
			molecule.chains = [];
			var currentTagTokens = content.split('\n');
			var helices = [];
			var sheets = [];
			var lastC = null;
			var currentChain = [];
			var resatoms = [];
			var atomSerials = [];
			for ( var i = 0, ii = currentTagTokens.length; i < ii; i++) {
				var line = currentTagTokens[i];
				if (extensions.stringStartsWith(line, 'HELIX')) {
					helices.push({
						id : line.substring(19, 20),
						start : parseInt(line.substring(21, 25)),
						end : parseInt(line.substring(33, 37))
					});
				} else if (extensions.stringStartsWith(line, 'SHEET')) {
					sheets.push({
						id : line.substring(21, 22),
						start : parseInt(line.substring(22, 26)),
						end : parseInt(line.substring(33, 37))
					});
				} else if (extensions.stringStartsWith(line, 'ATOM')) {
					var altLoc = line.substring(16, 17);
					if (altLoc == ' ' || altLoc == 'A') {
						var label = $.trim(line.substring(76, 78));
						if (label.length == 0) {
							var s = $.trim(line.substring(12, 14));
							if (s == 'HD') {
								label = 'H';
							} else if (s.length > 0) {
								if (s.length > 1) {
									label = s.charAt(0) + s.substring(1).toLowerCase();
								} else {
									label = s;
								}
							}
						}
						var a = new structures.Atom(label, parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54)));
						a.hetatm = false;
						resatoms.push(a);
						// set up residue
						var resSeq = parseInt(line.substring(22, 26));
						if (currentChain.length == 0) {
							for ( var j = 0; j < 2; j++) {
								var dummyFront = new structures.Residue(-1);
								dummyFront.cp1 = a;
								dummyFront.cp2 = a;
								currentChain.push(dummyFront);
							}
						}
						if (resSeq != Number.NaN && currentChain[currentChain.length - 1].resSeq != resSeq) {
							var r = new structures.Residue(resSeq);
							r.name = $.trim(line.substring(17, 20));
							if (r.name.length == 3) {
								r.name = r.name.substring(0, 1) + r.name.substring(1).toLowerCase();
							} else {
								if (r.name.length == 2 && r.name.charAt(0) == 'D') {
									r.name = r.name.substring(1);
								}
							}
							currentChain.push(r);
							var chainID = line.substring(21, 22);
							checkContained(r, helices, chainID, resSeq, true);
							checkContained(r, sheets, chainID, resSeq, false);
						}
						// end residue setup
						var atomName = $.trim(line.substring(12, 16));
						var currentResidue = currentChain[currentChain.length - 1];
						if (atomName == 'CA' || atomName == 'P' || atomName == 'O5\'') {
							if (!currentResidue.cp1) {
								currentResidue.cp1 = a;
							}
						} else if (atomName == 'N3' && (currentResidue.name=='C'||currentResidue.name=='U'||currentResidue.name=='T') || atomName == 'N1' && (currentResidue.name=='A'||currentResidue.name=='G')) {
							//control points for base platform direction
							currentResidue.cp3 = a;
						} else if (atomName == 'C2') {
							//control points for base platform orientation
							currentResidue.cp4 = a;
						} else if (atomName == 'C4' && (currentResidue.name=='C'||currentResidue.name=='U'||currentResidue.name=='T') || atomName == 'C6' && (currentResidue.name=='A'||currentResidue.name=='G')) {
							//control points for base platform orientation
							currentResidue.cp5 = a;
						} else if (atomName == 'O' || atomName == 'C6' && (currentResidue.name=='C'||currentResidue.name=='U'||currentResidue.name=='T') || atomName == 'N9') {
							if (!currentChain[currentChain.length - 1].cp2) {
								if (atomName == 'C6' || atomName == 'N9') {
									lastC = a;
								}
								currentResidue.cp2 = a;
							}
						} else if (atomName == 'C') {
							lastC = a;
						}
					}
				} else if (extensions.stringStartsWith(line, 'HETATM')) {
					var symbol = $.trim(line.substring(76, 78));
					if (symbol.length > 1) {
						symbol = symbol.substring(0, 1) + symbol.substring(1).toLowerCase();
					}
					var het = new structures.Atom(symbol, parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54)));
					het.hetatm = true;
					var residueName = $.trim(line.substring(17, 20));
					if (residueName == 'HOH') {
						het.isWater = true;
					}
					molecule.atoms.push(het);
					atomSerials[parseInt($.trim(line.substring(6, 11)))] = het;
				} else if(extensions.stringStartsWith(line, 'CONECT')){
					var oid = parseInt($.trim(line.substring(6, 11)));
					if(atomSerials[oid]){
						var origin = atomSerials[oid];
						for(var k = 0; k<4; k++){
							var next = $.trim(line.substring(11+k*5, 16+k*5));
							if(next.length!=0){
								var nid = parseInt(next);
								if(atomSerials[nid]){
									var a2 = atomSerials[nid];
									var found = false;
									for(var j = 0, jj = molecule.bonds.length; j<jj; j++){
										var b = molecule.bonds[j];
										if(b.a1==origin&&b.a2==a2||b.a1==a2&&b.a2==origin){
											found = true;
											break;
										}
									}
									if(!found){
										molecule.bonds.push(new structures.Bond(origin, a2));
									}
								}
							}
						}
					}
				} else if (extensions.stringStartsWith(line, 'TER')) {
					this.endChain(molecule, currentChain, lastC);
					currentChain = [];
				} else if (extensions.stringStartsWith(line, 'ENDMDL')) {
					break;
				}
			}
			this.endChain(molecule, currentChain, lastC);
			if(molecule.bonds.length==0){
				var margin = 1.1;
				for ( var i = 0, ii = molecule.atoms.length; i < ii; i++) {
					for ( var j = i + 1; j < ii; j++) {
						var first = molecule.atoms[i];
						var second = molecule.atoms[j];
						if (first.distance3D(second) < (ELEMENT[first.label].covalentRadius + ELEMENT[second.label].covalentRadius) * margin) {
							molecule.bonds.push(new structures.Bond(first, second, 1));
						}
					}
				}
			}
			if(this.deduceResidueBonds){
				for ( var i = 0, ii = resatoms.length; i < ii; i++) {
					var max = Math.min(ii, i+20);
					for ( var j = i + 1; j <max; j++) {
						var first = resatoms[i];
						var second = resatoms[j];
						if (first.distance3D(second) < (ELEMENT[first.label].covalentRadius + ELEMENT[second.label].covalentRadius)*1.1) {
							molecule.bonds.push(new structures.Bond(first, second, 1));
						}
					}
				}
			}
			molecule.atoms = molecule.atoms.concat(resatoms);
			if (this.calculateRibbonDistances) {
				this.calculateDistances(molecule, resatoms);
			}
			return molecule;
		};
		this.endChain = function(molecule, chain, lastC) {
			if (chain.length > 0) {
				var last = chain[chain.length - 1];
				if (!last.cp1) {
					last.cp1 = molecule.atoms[molecule.atoms.length - 2];
				}
				if (!last.cp2) {
					last.cp2 = molecule.atoms[molecule.atoms.length - 1];
				}
				for ( var i = 0; i < 4; i++) {
					var dummyEnd = new structures.Residue(-1);
					dummyEnd.cp1 = lastC;
					dummyEnd.cp2 = chain[chain.length - 1].cp2;
					chain.push(dummyEnd);
				}
				molecule.chains.push(chain);
			}
		};
		this.calculateDistances = function(molecule, resatoms) {
			var hetatm = [];
			for ( var i = 0, ii = molecule.atoms.length; i < ii; i++) {
				var a = molecule.atoms[i];
				if (a.hetatm) {
					if (!a.isWater) {
						hetatm.push(a);
					}
				}
			}
			for ( var i = 0, ii = resatoms.length; i < ii; i++) {
				var a = resatoms[i];
				a.closestDistance = Number.POSITIVE_INFINITY;
				if (hetatm.length == 0) {
					a.closestDistance = 0;
				} else {
					for ( var j = 0, jj = hetatm.length; j < jj; j++) {
						a.closestDistance = Math.min(a.closestDistance, a.distance3D(hetatm[j]));
					}
				}
			}
		};
	};

	// shortcuts
	var interpreter = new io.PDBInterpreter();
	c.readPDB = function(content) {
		return interpreter.read(content);
	};

})(ChemDoodle, ChemDoodle.extensions, ChemDoodle.io, ChemDoodle.structures, ChemDoodle.ELEMENT);

//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 2974 $
//  $Author: kevin $
//  $LastChangedDate: 2010-12-29 11:07:06 -0500 (Wed, 29 Dec 2010) $
//

ChemDoodle.monitor = (function(document) {
	var m = {};

	m.CANVAS_DRAGGING = null;
	m.CANVAS_OVER = null;
	m.ALT = false;
	m.SHIFT = false;
	m.META = false;

	if (!('ontouchstart' in window)) {
		$(document).ready(function() {
			// handles dragging beyond the canvas bounds
			$(document).mousemove(function(e) {
				if (m.CANVAS_DRAGGING != null) {
					if (m.CANVAS_DRAGGING.drag) {
						m.CANVAS_DRAGGING.prehandleEvent(e);
						m.CANVAS_DRAGGING.drag(e);
					}
				}
			});
			$(document).mouseup(function(e) {
				if (m.CANVAS_DRAGGING != null && m.CANVAS_DRAGGING != m.CANVAS_OVER) {
					if (m.CANVAS_DRAGGING.mouseup) {
						m.CANVAS_DRAGGING.prehandleEvent(e);
						m.CANVAS_DRAGGING.mouseup(e);
					}
				}
				m.CANVAS_DRAGGING = null;
			});
			// handles modifier keys from a single keyboard
			$(document).keydown(function(e) {
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
			$(document).keypress(function(e) {
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
			$(document).keyup(function(e) {
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
	}

	return m;

})(document);
//
//  Copyright 2009 iChemLabs, LLC.  All rights reserved.
//
//  $Revision: 3519 $
//  $Author: kevin $
//  $LastChangedDate: 2012-05-02 20:59:30 -0400 (Wed, 02 May 2012) $
//

(function(c, monitor, extensions, math, structures, RESIDUE, document, m4, m3, v3, window) {

	c.Canvas = function(id) {
		this.rotationMatrix = m4.identity([]);
		this.translationMatrix = m4.identity([]);
		this.id = id;
		var jqCapsule = $('#' + id);
		this.width = jqCapsule.attr('width');
		this.height = jqCapsule.attr('height');
		this.specs = new structures.VisualSpecifications();
		// setup input events
		// make sure prehandle events are only in if statements if handled, so
		// as not to block browser events
		var me = this;
		if ('ontouchstart' in window) {
			// for iPhone OS and Android devices (and other mobile browsers that
			// support mobile events)
			jqCapsule.bind('touchstart', function(e) {
				var time = new Date().getTime();
				if (me.lastTouch && e.originalEvent.touches.length == 1 && (time - me.lastTouch) < 500) {
					if (me.dbltap) {
						me.prehandleEvent(e);
						me.dbltap(e);
					} else if (me.dblclick) {
						me.prehandleEvent(e);
						me.dblclick(e);
					} else if (me.touchstart) {
						me.prehandleEvent(e);
						me.touchstart(e);
					} else if (me.mousedown) {
						me.prehandleEvent(e);
						me.mousedown(e);
					}
				} else if (me.touchstart) {
					me.prehandleEvent(e);
					me.touchstart(e);
					if(this.hold){
						clearTimeout(this.hold);
					}
					if(this.touchhold){
						this.hold = setTimeout(function(){
							me.touchhold(e);
						}, 1000);
					}
				} else if (me.mousedown) {
					me.prehandleEvent(e);
					me.mousedown(e);
				}
				me.lastTouch = time;
			});
			jqCapsule.bind('touchmove', function(e) {
				if(this.hold!=null){
					clearTimeout(this.hold);
					this.hold = null;
				}
				if (e.originalEvent.touches.length > 1 && me.multitouchmove) {
					var numFingers = e.originalEvent.touches.length;
					me.prehandleEvent(e);
					var center = new structures.Point(-e.offset.left * numFingers, -e.offset.top * numFingers);
					for ( var i = 0; i < numFingers; i++) {
						center.x += e.originalEvent.changedTouches[i].pageX;
						center.y += e.originalEvent.changedTouches[i].pageY;
					}
					center.x /= numFingers;
					center.y /= numFingers;
					e.p = center;
					me.multitouchmove(e, numFingers);
				} else if (me.touchmove) {
					me.prehandleEvent(e);
					me.touchmove(e);
				} else if (me.drag) {
					me.prehandleEvent(e);
					me.drag(e);
				}
			});
			jqCapsule.bind('touchend', function(e) {
				if(this.hold!=null){
					clearTimeout(this.hold);
					this.hold = null;
				}
				if (me.touchend) {
					me.prehandleEvent(e);
					me.touchend(e);
				} else if (me.mouseup) {
					me.prehandleEvent(e);
					me.mouseup(e);
				}
				if((new Date().getTime() - me.lastTouch) < 250){
					if(me.tap){
						me.prehandleEvent(e);
						me.tap(e);
					}else if(me.click){
						me.prehandleEvent(e);
						me.click(e);
					}
				}
			});
			jqCapsule.bind('gesturestart', function(e) {
				if (me.gesturestart) {
					me.prehandleEvent(e);
					me.gesturestart(e);
				}
			});
			jqCapsule.bind('gesturechange', function(e) {
				if (me.gesturechange) {
					me.prehandleEvent(e);
					me.gesturechange(e);
				}
			});
			jqCapsule.bind('gestureend', function(e) {
				if (me.gestureend) {
					me.prehandleEvent(e);
					me.gestureend(e);
				}
			});
		} else {
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
					monitor.CANVAS_DRAGGING = me;
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
				if (monitor.CANVAS_DRAGGING == null && me.mousemove) {
					me.prehandleEvent(e);
					me.mousemove(e);
				}
			});
			jqCapsule.mouseout(function(e) {
				monitor.CANVAS_OVER = null;
				if (me.mouseout) {
					me.prehandleEvent(e);
					me.mouseout(e);
				}
			});
			jqCapsule.mouseover(function(e) {
				monitor.CANVAS_OVER = me;
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
		}
		// setup gl object
		var canvas = document.getElementById(this.id);
		this.gl = canvas.getContext('webgl');
		if (!this.gl) {
			this.gl = canvas.getContext('experimental-webgl');
		}
		this.gl.program = this.gl.createProgram();
		this.gl.shader = new structures.Shader(this.gl);
		this.setupScene();
		return true;
	};
	c.Canvas.prototype.loadMolecule = function(molecule) {
		this.molecule = molecule;
		this.center();
		var d = this.molecule.getDimension();
		this.maxDimension = Math.max(d.x, d.y);
		this.translationMatrix = m4.translate(m4.identity([]), [ 0, 0, -this.maxDimension - 10 ]);
		this.setupScene();
		this.repaint();
	};
	c.Canvas.prototype.prehandleEvent = function(e) {
		if (e.originalEvent.changedTouches) {
			e.pageX = e.originalEvent.changedTouches[0].pageX;
			e.pageY = e.originalEvent.changedTouches[0].pageY;
		}
		e.preventDefault();
		e.offset = $('#' + this.id).offset();
		e.p = new structures.Point(e.pageX - e.offset.left, e.pageY - e.offset.top);
	};
	c.Canvas.prototype.setViewDistance = function(distance) {
		this.translationMatrix = m4.translate(m4.identity([]), [ 0, 0, -distance ]);
	};
	c.Canvas.prototype.repaint = function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.modelViewMatrix = m4.multiply(this.translationMatrix, this.rotationMatrix, []);
		this.gl.rotationMatrix = this.rotationMatrix;
		this.molecule.render(this.gl, this.specs);
		this.gl.flush();
	};
	c.Canvas.prototype.center = function() {
		var canvas = document.getElementById(this.id);
		var p = this.molecule.getCenter3D();
		for ( var i = 0, ii = this.molecule.atoms.length; i < ii; i++) {
			this.molecule.atoms[i].sub3D(p);
		}
		if (this.molecule.chains && this.molecule.fromJSON) {
			for ( var i = 0, ii = this.molecule.chains.length; i < ii; i++) {
				var chain = this.molecule.chains[i];
				for ( var j = 0, jj = chain.length; j < jj; j++) {
					var residue = chain[j];
					residue.cp1.sub3D(p);
					residue.cp2.sub3D(p);
					if (residue.cp3) {
						residue.cp3.sub3D(p);
						residue.cp4.sub3D(p);
						residue.cp5.sub3D(p);
					}
				}
			}
		}
	};
	c.Canvas.prototype.setupScene = function() {
		// clear the canvas
		var cs = math.getRGB(this.specs.backgroundColor);
		this.gl.clearColor(cs[0], cs[1], cs[2], 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		// here is the sphere buffer to be drawn, make it once, then scale
		// and translate to draw atoms
		this.gl.sphereBuffer = new structures.Sphere(1, this.specs.atoms_resolution_3D, this.specs.atoms_resolution_3D);
		this.gl.cylinderBuffer = new structures.Cylinder(1, 1, this.specs.bonds_resolution_3D);
		this.gl.lineBuffer = new structures.Line();
		if (this.molecule && this.molecule!=this.previousMolecule) {
			this.previousMolecule = this.molecule;
			if (this.molecule.chains) {
				this.molecule.ribbons = [];
				this.molecule.cartoons = [];
				// set up ribbon diagram if available and not already setup
				for ( var j = 0, jj = this.molecule.chains.length; j < jj; j++) {
					var rs = this.molecule.chains[j];
					var isNucleotide = rs.length > 2 && RESIDUE[rs[2].name] && RESIDUE[rs[2].name].aminoColor == '#BEA06E';
					if (rs.length > 0 && !rs[0].lineSegments) {
						for ( var i = 0, ii = rs.length - 1; i < ii; i++) {
							rs[i].setup(rs[i + 1].cp1, isNucleotide?1:this.specs.proteins_horizontalResolution);
						}
						if (!isNucleotide) {
							for ( var i = 1, ii = rs.length - 1; i < ii; i++) {
								// reverse guide points if carbonyl
								// orientation
								// flips
								if (extensions.vec3AngleFrom(rs[i - 1].D, rs[i].D) > Math.PI / 2) {
									rs[i].guidePointsSmall.reverse();
									rs[i].guidePointsLarge.reverse();
									v3.scale(rs[i].D, -1);
								}
							}
						}
						for ( var i = 1, ii = rs.length - 3; i < ii; i++) {
							// compute line segments
							rs[i].computeLineSegments(rs[i - 1], rs[i + 1], rs[i + 2], !isNucleotide, isNucleotide?this.specs.nucleics_verticalResolution:this.specs.proteins_verticalResolution);
						}
						// remove unneeded dummies
						rs.pop();
						rs.pop();
						rs.pop();
						rs.shift();
					}
					// create the hsl color for the chain
					var rgb = math.hsl2rgb(jj==1?.5:j / jj, 1, .5);
					var chainColor = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
					rs.chainColor = chainColor;
					var r = {
						front : new structures.Ribbon(rs, this.specs.proteins_ribbonThickness, false),
						back : new structures.Ribbon(rs, -this.specs.proteins_ribbonThickness, false)
					};
					r.front.chainColor = chainColor;
					r.back.chainColor = chainColor;
					for ( var i = 0, ii = r.front.segments.length; i < ii; i++) {
						r.front.segments[i].chainColor = chainColor;
					}
					for ( var i = 0, ii = r.back.segments.length; i < ii; i++) {
						r.back.segments[i].chainColor = chainColor;
					}
					this.molecule.ribbons.push(r);
					var c = {
						front : new structures.Ribbon(rs, this.specs.proteins_ribbonThickness, true),
						back : new structures.Ribbon(rs, -this.specs.proteins_ribbonThickness, true)
					};
					c.front.chainColor = chainColor;
					c.back.chainColor = chainColor;
					for ( var i = 0, ii = c.front.segments.length; i < ii; i++) {
						c.front.segments[i].chainColor = chainColor;
					}
					for ( var i = 0, ii = c.back.segments.length; i < ii; i++) {
						c.back.segments[i].chainColor = chainColor;
					}
					for ( var i = 0, ii = c.front.cartoonSegments.length; i < ii; i++) {
						c.front.cartoonSegments[i].chainColor = chainColor;
					}
					for ( var i = 0, ii = c.back.cartoonSegments.length; i < ii; i++) {
						c.back.cartoonSegments[i].chainColor = chainColor;
					}
					this.molecule.cartoons.push(c);
				}
			}
		}
		// set up lighting
		this.gl.lighting = new structures.Light(this.specs.lightDiffuseColor_3D, this.specs.lightSpecularColor_3D, this.specs.lightDirection_3D);
		this.gl.lighting.lightScene(this.gl);
		// set up material
		this.gl.material = new structures.Material(this.gl);
		// projection matrix
		// arg1: vertical field of view (degrees)
		// arg2: width to height ratio
		// arg3: front culling
		// arg4: back culling
		var widthHeightRatio = this.width/this.height;
		this.gl.projectionMatrix = m4.perspective(this.specs.projectionPerspectiveVerticalFieldOfView_3D, widthHeightRatio, this.specs.projectionFrontCulling_3D, this.specs.projectionBackCulling_3D);
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
			var normalMatrix = m3.transpose(m4.toInverseMat3(mvMatrix, []));
			this.uniformMatrix3fv(nUL, false, normalMatrix);
		};
	};
	c.Canvas.prototype.mousedown = function(e) {
		this.lastPoint = e.p;
	};
	c.Canvas.prototype.rightmousedown = function(e) {
		this.lastPoint = e.p;
	};
	c.Canvas.prototype.drag = function(e) {
		if (c.monitor.ALT) {
			var t = new structures.Point(e.p.x, e.p.y);
			t.sub(this.lastPoint);
			m4.translate(this.translationMatrix, [ t.x / 20, -t.y / 20, 0 ]);
			this.lastPoint = e.p;
			this.repaint();
		} else {
			var difx = e.p.x - this.lastPoint.x;
			var dify = e.p.y - this.lastPoint.y;
			var rotation = m4.rotate(m4.identity([]), difx * Math.PI / 180.0, [ 0, 1, 0 ]);
			m4.rotate(rotation, dify * Math.PI / 180.0, [ 1, 0, 0 ]);
			this.rotationMatrix = m4.multiply(rotation, this.rotationMatrix);
			this.lastPoint = e.p;
			this.repaint();
		}
	};
	c.Canvas.prototype.mousewheel = function(e, delta) {
		var dz = delta * this.maxDimension/8;
		m4.translate(this.translationMatrix, [ 0, 0, dz ]);
		this.repaint();
	};

})(ChemDoodle, ChemDoodle.monitor, ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.RESIDUE, document, mat4, mat3, vec3, window);
