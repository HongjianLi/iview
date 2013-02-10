var iview = (function () {

	function iview(id) {
		this.ElementColors = {
			'H ': 0xFFFFFF,
			'HD': 0xFFFFFF,
			'C ': 0x909090,
			'A ': 0x909090,
			'N ': 0x3050F8,
			'NA': 0x3050F8,
			'OA': 0xFF0D0D,
			'S ': 0xFFFF30,
			'SA': 0xFFFF30,
			'Se': 0xFFA100,
			'P ': 0xFF8000,
			'F ': 0x90E050,
			'Cl': 0x1FF01F,
			'Br': 0xA62929,
			'I ': 0x940094,
			'Zn': 0x7D80B0,
			'Fe': 0xE06633,
			'Mg': 0x8AFF00,
			'Ca': 0x3DFF00,
			'Mn': 0x9C7AC7,
			'Cu': 0xC88033,
			'Na': 0xAB5CF2,
			'K ': 0x8F40D4,
			'Hg': 0xB8B8D0,
			'Ni': 0x50D050,
			'Co': 0xF090A0,
			'Cd': 0xFFD98F,
			'As': 0xBD80E3,
			'Sr': 0x00FF00,
		};
		
		this.vdwRadii = {
			'H ': 1.2,
			'HD': 1.2,
			'C ': 1.7,
			'A ': 1.7,
			'N ': 1.55,
			'NA': 1.55,
			'Na': 2.27,
			'OA': 1.52,
			'S ': 1.80,
			'SA': 1.80,
			'Se': 1.90,
			'P ': 1.80,
			'F ': 1.47,
			'Cl': 1.75,
			'Br': 1.85,
			'Zn': 1.39,
			'Cu': 1.4,
			'K ': 2.75,
			'Ni': 1.63
		};

		this.container = $('#' + id);
		this.WIDTH = this.container.width();
		this.HEIGHT = this.container.height();
		this.ASPECT = this.WIDTH / this.HEIGHT;
		this.CAMERA_Z = -130;
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.container.get(0),
			antialias: true
		});
		this.renderer.sortObjects = false;
		this.renderer.setSize(this.WIDTH, this.HEIGHT);

		var me = this;
		$(window).resize(function () {
			me.WIDTH = me.container.width();
			me.HEIGHT = me.container.height();
			me.ASPECT = me.WIDTH / me.HEIGHT;
			me.renderer.setSize(me.WIDTH, me.HEIGHT);
			me.camera.aspect = me.ASPECT;
			me.camera.updateProjectionMatrix();
			me.show();
		});

		this.fov = 20;
		this.fogStart = 0.4;
		this.slabNear = -50; // relative to the center of rotationGroup
		this.slabFar = +50;
		this.sphereRadius = 1.5;
		this.cylinderRadius = 0.4;
		this.lineWidth = 1.5;
		this.curveWidth = 3;
		this.defaultColor = 0xCCCCCC;
		this.sphereQuality = 16; //16;
		this.cylinderQuality = 16; //8;
		this.axisDIV = 5; // 3 still gives acceptable quality
		this.strandDIV = 6;
		this.tubeDIV = 8;
		this.coilWidth = 0.3;
		this.helixSheetWidth = 1.3;
		this.thickness = 0.4;

		this.perspectiveCamera = new THREE.PerspectiveCamera(20, this.ASPECT, 1, 800);
		this.perspectiveCamera.position = new THREE.Vector3(0, 0, this.CAMERA_Z);
		this.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
		this.orthographicCamera = new THREE.OrthographicCamera();
		this.orthographicCamera.position.z = this.CAMERA_Z;
		this.orthographicCamera.lookAt(new THREE.Vector3(0, 0, 0));
		this.cameras = {
			 perspective: this.perspectiveCamera,
			orthographic: this.orthographicCamera,
		}
		this.backgroundColors = {
			white: 0xFFFFFF,
			 grey: 0xCCCCCC,
			black: 0x000000,
		};
		this.residueColors = {
			ALA: 0xC8C8C8,
			ARG: 0x145AFF,
			ASN: 0x00DCDC,
			ASP: 0xE60A0A,
			CYS: 0xE6E600,
			GLN: 0x00DCDC,
			GLU: 0xE60A0A,
			GLY: 0xEBEBEB,
			HIS: 0x8282D2,
			ILE: 0x0F820F,
			LEU: 0x0F820F,
			LYS: 0x145AFF,
			MET: 0xE6E600,
			PHE: 0x3232AA,
			PRO: 0xDC9682,
			SER: 0xFA9600,
			THR: 0xFA9600,
			TRP: 0xB45AB4,
			TYR: 0x3232AA,
			VAL: 0x0F820F,
			ASX: 0xFF69B4,
			GLX: 0xFF69B4,
		};
		this.polarColor = 0xcc0000;
		this.nonpolarColor = 0x00CCCC;
		this.polarityColors = {
			ARG: this.polarColor,
			HIS: this.polarColor,
			LYS: this.polarColor,
			ASP: this.polarColor,
			GLU: this.polarColor,
			SER: this.polarColor,
			THR: this.polarColor,
			ASN: this.polarColor,
			GLN: this.polarColor,
			CYS: this.polarColor,
			GLY: this.nonpolarColor,
			PRO: this.nonpolarColor,
			ALA: this.nonpolarColor,
			VAL: this.nonpolarColor,
			LEU: this.nonpolarColor,
			ILE: this.nonpolarColor,
			MET: this.nonpolarColor,
			PHE: this.nonpolarColor,
			TYR: this.nonpolarColor,
			TRP: this.nonpolarColor,
		};
		this.colorBy = {
			'spectrum': function () {
				for (var i in me.atoms) {
					me.atoms[i].color = new THREE.Color().setHSV(0.66 * (1 - i / me.atoms.length), 1, 0.9).getHex();
				}
			},
			'chain': function () {
				for (var i in me.atoms) {
					var atom = me.atoms[i];
					atom.color = new THREE.Color().setHSV((atom.chain.charCodeAt(0) * 5) % 17 / 17.0, 1, 0.9).getHex();
				}
			},
//			'secondary structure': me.colorByStructure,
			'B factor': function () {
				var minB = 1000, maxB = -1000;
				for (var i in me.atoms) {
					var atom = me.atoms[i];
					if (minB > atom.b) minB = atom.b;
					if (maxB < atom.b) maxB = atom.b;
				}
				var mid = (maxB + minB) * 0.5;
				var range = (maxB - minB) * 0.5;
				for (var i in me.atoms) {
					var atom = me.atoms[i];
					atom.color = atom.b < mid ? new THREE.Color().setHSV(0.667, (mid - atom.b) / range, 1).getHex() : new THREE.Color().setHSV(0, (atom.b - mid) / range, 1).getHex();
				}
			},
			'residue': function () {
				for (var i in me.atoms) {
					var atom = me.atoms[i];
					atom.color = me.residueColors[atom.resn] || me.defaultColor;
				}
			},
			'polarity': function () {
				for (var i in me.atoms) {
					var atom = me.atoms[i];
					atom.color = me.polarityColors[atom.resn] || me.defaultColor;
				}
			},
			'atom': function () {
				for (var i in me.atoms) {
					var atom = me.atoms[i];
					atom.color = me.ElementColors[atom.elem] || me.defaultColor;
				}
			},
		};
		this.options = {
			camera: 'perspective',
			background: 'white',
			colorBy: 'spectrum',
			secondaryStructure: 'thick ribbon',
			primaryStructure: 'none',
			ligands: 'stick',
			waters: 'sphere',
			ions: 'sphere',
		};

		// UI variables
		this.cq = new THREE.Quaternion(1, 0, 0, 0);
		this.dq = new THREE.Quaternion(1, 0, 0, 0);
		this.isDragging = false;
		this.mouseStartX = 0;
		this.mouseStartY = 0;
		this.currentModelPos = 0;
		this.cz = 0;

		var glDOM = $(this.renderer.domElement);
		glDOM.bind("contextmenu", function (ev) { ev.preventDefault(); });
		glDOM.bind('mousedown touchstart', function (ev) {
			ev.preventDefault();
			if (!me.scene) return;
			var x = ev.pageX, y = ev.pageY;
			if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
				x = ev.originalEvent.targetTouches[0].pageX;
				y = ev.originalEvent.targetTouches[0].pageY;
			}
			if (x == undefined) return;
			me.isDragging = true;
			me.mouseButton = ev.which;
			me.mouseStartX = x;
			me.mouseStartY = y;
			me.cq = me.rotationGroup.quaternion;
			me.cz = me.rotationGroup.position.z;
			me.currentModelPos = me.modelGroup.position.clone();
			me.cslabNear = me.slabNear;
			me.cslabFar = me.slabFar;
		});
		glDOM.bind('DOMMouseScroll mousewheel', function (ev) { // Zoom
			ev.preventDefault();
			if (!me.scene) return;
			var scaleFactor = (me.rotationGroup.position.z - me.CAMERA_Z) * 0.85;
			if (ev.originalEvent.detail) { // Webkit
				me.rotationGroup.position.z += scaleFactor * ev.originalEvent.detail / 10;
			} else if (ev.originalEvent.wheelDelta) { // Firefox
				me.rotationGroup.position.z -= scaleFactor * ev.originalEvent.wheelDelta / 400;
			}
			me.show();
		});
		$('body').bind('mouseup touchend', function (ev) {
			me.isDragging = false;
		});
		glDOM.bind('mousemove touchmove', function (ev) { // touchmove
			ev.preventDefault();
			if (!me.scene) return;
			if (!me.isDragging) return;
			var mode = 0;
			var x = ev.pageX, y = ev.pageY;
			if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
				x = ev.originalEvent.targetTouches[0].pageX;
				y = ev.originalEvent.targetTouches[0].pageY;
			}
			if (x == undefined) return;
			var dx = (x - me.mouseStartX) / me.WIDTH;
			var dy = (y - me.mouseStartY) / me.HEIGHT;
			if (mode == 3 || (me.mouseButton == 3 && ev.ctrlKey)) { // Slab
				me.slabNear = me.cslabNear + dx * 100;
				me.slabFar = me.cslabFar + dy * 100;
			} else if (mode == 2 || me.mouseButton == 3 || ev.shiftKey) { // Zoom
				var scaleFactor = (me.rotationGroup.position.z - me.CAMERA_Z) * 0.85;
				if (scaleFactor < 80) scaleFactor = 80;
				me.rotationGroup.position.z = me.cz - dy * scaleFactor;
			} else if (mode == 1 || me.mouseButton == 2 || ev.ctrlKey) { // Translate
				var scaleFactor = (me.rotationGroup.position.z - me.CAMERA_Z) * 0.85;
				if (scaleFactor < 20) scaleFactor = 20;
				var translationByScreen = new THREE.Vector3(-dx * scaleFactor, -dy * scaleFactor, 0);
				var q = me.rotationGroup.quaternion;
				var qinv = new THREE.Quaternion(q.x, q.y, q.z, q.w).inverse().normalize();
				var translation = qinv.multiplyVector3(translationByScreen);
				me.modelGroup.position.x = me.currentModelPos.x + translation.x;
				me.modelGroup.position.y = me.currentModelPos.y + translation.y;
				me.modelGroup.position.z = me.currentModelPos.z + translation.z;
			} else if ((mode == 0 || me.mouseButton == 1)) { // Rotate
				var r = Math.sqrt(dx * dx + dy * dy);
				var rs = Math.sin(r * Math.PI) / r;
				me.dq.x = Math.cos(r * Math.PI);
				me.dq.y = 0;
				me.dq.z = rs * dx;
				me.dq.w = rs * dy;
				me.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0);
				me.rotationGroup.quaternion.multiply(me.dq);
				me.rotationGroup.quaternion.multiply(me.cq);
			}
			me.show();
		});
	}

	// Catmull-Rom subdivision
	iview.prototype.subdivide = function (_points, DIV) { // points as Vector3
		var ret = [];
		var points = _points;
		points = new Array(); // Smoothing test
		points.push(_points[0]);
		for (var i = 1, lim = _points.length - 1; i < lim; i++) {
			var p1 = _points[i], p2 = _points[i + 1];
			if (p1.smoothen) points.push(new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2));
			else points.push(p1);
		}
		points.push(_points[_points.length - 1]);
		for (var i = -1, size = points.length; i <= size - 3; i++) {
			var p0 = points[(i == -1) ? 0 : i];
			var p1 = points[i + 1], p2 = points[i + 2];
			var p3 = points[(i == size - 3) ? size - 1 : i + 3];
			var v0 = new THREE.Vector3().subVectors(p2, p0).multiplyScalar(0.5);
			var v1 = new THREE.Vector3().subVectors(p3, p1).multiplyScalar(0.5);
			for (var j = 0; j < DIV; j++) {
				var t = 1.0 / DIV * j;
				var x = p1.x + t * v0.x
						 + t * t * (-3 * p1.x + 3 * p2.x - 2 * v0.x - v1.x)
						 + t * t * t * (2 * p1.x - 2 * p2.x + v0.x + v1.x);
				var y = p1.y + t * v0.y
						 + t * t * (-3 * p1.y + 3 * p2.y - 2 * v0.y - v1.y)
						 + t * t * t * (2 * p1.y - 2 * p2.y + v0.y + v1.y);
				var z = p1.z + t * v0.z
						 + t * t * (-3 * p1.z + 3 * p2.z - 2 * v0.z - v1.z)
						 + t * t * t * (2 * p1.z - 2 * p2.z + v0.z + v1.z);
				ret.push(new THREE.Vector3(x, y, z));
			}
		}
		ret.push(points[points.length - 1]);
		return ret;
	};

	iview.prototype.drawAtomsAsSphere = function (group, atomlist, defaultRadius, forceDefault, scale) {
		var sphereGeometry = new THREE.SphereGeometry(1, this.sphereQuality, this.sphereQuality); // r, seg, ring
		for (var i = 0; i < atomlist.length; i++) {
			var atom = this.atoms[atomlist[i]];
			if (atom == undefined) continue;
			var sphereMaterial = new THREE.MeshLambertMaterial({ color: atom.color });
			var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
			group.add(sphere);
			var r = (!forceDefault && this.vdwRadii[atom.elem] != undefined) ? this.vdwRadii[atom.elem] : defaultRadius;
			if (!forceDefault && scale) r *= scale;
			sphere.scale.x = sphere.scale.y = sphere.scale.z = r;
			sphere.position.x = atom.x;
			sphere.position.y = atom.y;
			sphere.position.z = atom.z;
		}
	};

	// about two times faster than sphere when div = 2
	iview.prototype.drawAtomsAsIcosahedron = function (group, atomlist, defaultRadius, forceDefault) {
		var geo = this.IcosahedronGeometry();
		for (var i = 0; i < atomlist.length; i++) {
			var atom = this.atoms[atomlist[i]];
			if (atom == undefined) continue;
			var mat = new THREE.MeshLambertMaterial({ color: atom.color });
			var sphere = new THREE.Mesh(geo, mat);
			sphere.scale.x = sphere.scale.y = sphere.scale.z = (!forceDefault && this.vdwRadii[atom.elem] != undefined) ? this.vdwRadii[atom.elem] : defaultRadius;
			group.add(sphere);
			sphere.position.x = atom.x;
			sphere.position.y = atom.y;
			sphere.position.z = atom.z;
		}
	};

	iview.prototype.isConnected = function (atom1, atom2) {
		var s = atom1.bonds.indexOf(atom2.serial);
		if (s != -1) return atom1.bondOrder[s];
		var distSquared = (atom1.x - atom2.x) * (atom1.x - atom2.x) +
						  (atom1.y - atom2.y) * (atom1.y - atom2.y) +
						  (atom1.z - atom2.z) * (atom1.z - atom2.z);
		//   if (atom1.altLoc != atom2.altLoc) return false;
		if (isNaN(distSquared)) return 0;
		if (distSquared < 0.5) return 0; // maybe duplicate position.
		if (distSquared > 1.3 && (atom1.elem == 'H ' || atom2.elem == 'H ' || atom1.elem == 'HD' || atom2.elem == 'HD')) return 0;
		if (distSquared < 3.42 && (atom1.elem == 'S ' || atom2.elem == 'S ')) return 1;
		if (distSquared > 2.78) return 0;
		return 1;
	};

	iview.prototype.drawBondAsStickSub = function (group, atom1, atom2, bondR, order) {
		var delta, tmp;
		if (order > 1) delta = this.calcBondDelta(atom1, atom2, bondR * 2.3);
		var p1 = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
		var p2 = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
		var mp = p1.clone().add(p2).multiplyScalar(0.5);

		var c1 = new THREE.Color(atom1.color), c2 = new THREE.Color(atom2.color);
		if (order == 1 || order == 3) {
			this.drawCylinder(group, p1, mp, bondR, atom1.color);
			this.drawCylinder(group, p2, mp, bondR, atom2.color);
		}
		if (order > 1) {
			tmp = mp.clone().add(delta);
			this.drawCylinder(group, p1.clone().add(delta), tmp, bondR, atom1.color);
			this.drawCylinder(group, p2.clone().add(delta), tmp, bondR, atom2.color);
			tmp = mp.clone().sub(delta);
			this.drawCylinder(group, p1.clone().sub(delta), tmp, bondR, atom1.color);
			this.drawCylinder(group, p2.clone().sub(delta), tmp, bondR, atom2.color);
		}
	};

	iview.prototype.drawBondsAsStick = function (group, atomlist, bondR, atomR, ignoreNonbonded, multipleBonds, scale) {
		var sphereGeometry = new THREE.SphereGeometry(1, this.sphereQuality, this.sphereQuality);
		var nAtoms = atomlist.length, mp;
		var forSpheres = [];
		if (!!multipleBonds) bondR /= 2.5;
		for (var _i = 0; _i < nAtoms; _i++) {
			var i = atomlist[_i];
			var atom1 = this.atoms[i];
			if (atom1 == undefined) continue;
			for (var _j = _i + 1; _j < _i + 30 && _j < nAtoms; _j++) {
				var j = atomlist[_j];
				var atom2 = this.atoms[j];
				if (atom2 == undefined) continue;
				var order = this.isConnected(atom1, atom2);
				if (order == 0) continue;
				atom1.connected = atom2.connected = true;
				this.drawBondAsStickSub(group, atom1, atom2, bondR, (!!multipleBonds) ? order : 1);
			}
			for (var _j = 0; _j < atom1.bonds.length; _j++) {
				var j = atom1.bonds[_j];
				if (j < i + 30) continue; // be conservative!
				if (atomlist.indexOf(j) == -1) continue;
				var atom2 = this.atoms[j];
				if (atom2 == undefined) continue;
				atom1.connected = atom2.connected = true;
				this.drawBondAsStickSub(group, atom1, atom2, bondR, (!!multipleBonds) ? atom1.bondOrder[_j] : 1);
			}
			if (atom1.connected) forSpheres.push(i);
		}
		this.drawAtomsAsSphere(group, forSpheres, atomR, !scale, scale);
	};

	// TODO: Find inner side of a ring
	iview.prototype.calcBondDelta = function (atom1, atom2, sep) {
		var dot;
		var axis = new THREE.Vector3(atom1.x - atom2.x, atom1.y - atom2.y, atom1.z - atom2.z).normalize();
		var found = null;
		for (var i = 0; i < atom1.bonds.length && !found; i++) {
			var atom = this.atoms[atom1.bonds[i]]; if (!atom) continue;
			if (atom.serial != atom2.serial && atom.elem != 'H ' && atom.elem != 'HD') found = atom;
		}
		for (var i = 0; i < atom2.bonds.length && !found; i++) {
			var atom = this.atoms[atom2.bonds[i]]; if (!atom) continue;
			if (atom.serial != atom1.serial && atom.elem != 'H ' && atom.elem != 'HD') found = atom;
		}
		if (found) {
			var tmp = new THREE.Vector3(atom1.x - found.x, atom1.y - found.y, atom1.z - found.z).normalize();
			dot = tmp.dot(axis);
			delta = new THREE.Vector3(tmp.x - axis.x * dot, tmp.y - axis.y * dot, tmp.z - axis.z * dot);
		}
		if (!found || Math.abs(dot - 1) < 0.001 || Math.abs(dot + 1) < 0.001) {
			if (axis.x < 0.01 && axis.y < 0.01) {
				delta = new THREE.Vector3(0, -axis.z, axis.y);
			} else {
				delta = new THREE.Vector3(-axis.y, axis.x, 0);
			}
		}
		delta.normalize().multiplyScalar(sep);
		return delta;
	};

	iview.prototype.drawBondsAsLineSub = function (geo, atom1, atom2, order) {
		var delta, tmp, vs = geo.vertices, cs = geo.colors;
		if (order > 1) delta = this.calcBondDelta(atom1, atom2, 0.15);
		var p1 = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
		var p2 = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
		var mp = p1.clone().add(p2).multiplyScalar(0.5);
		var c1 = new THREE.Color(atom1.color), c2 = new THREE.Color(atom2.color);
		if (order == 1 || order == 3) {
			vs.push(p1); cs.push(c1); vs.push(mp); cs.push(c1);
			vs.push(p2); cs.push(c2); vs.push(mp); cs.push(c2);
		}
		if (order > 1) {
			vs.push(p1.clone().add(delta)); cs.push(c1);
			vs.push(tmp = mp.clone().add(delta)); cs.push(c1);
			vs.push(p2.clone().add(delta)); cs.push(c2);
			vs.push(tmp); cs.push(c2);
			vs.push(p1.clone().sub(delta)); cs.push(c1);
			vs.push(tmp = mp.clone().sub(delta)); cs.push(c1);
			vs.push(p2.clone().sub(delta)); cs.push(c2);
			vs.push(tmp); cs.push(c2);
		}
	};

	iview.prototype.drawBondsAsLine = function (group, atomlist, lineWidth) {
		var geo = new THREE.Geometry();
		var nAtoms = atomlist.length;
		for (var _i = 0; _i < nAtoms; _i++) {
			var i = atomlist[_i];
			var atom1 = this.atoms[i];
			if (atom1 == undefined) continue;
			for (var _j = _i + 1; _j < _i + 30 && _j < nAtoms; _j++) {
				var j = atomlist[_j];
				var atom2 = this.atoms[j];
				if (atom2 == undefined) continue;
				var order = this.isConnected(atom1, atom2);
				if (order == 0) continue;

				this.drawBondsAsLineSub(geo, atom1, atom2, order);
			}
			for (var _j = 0; _j < atom1.bonds.length; _j++) {
				var j = atom1.bonds[_j];
				if (j < i + 30) continue; // be conservative!
				if (atomlist.indexOf(j) == -1) continue;
				var atom2 = this.atoms[j];
				if (atom2 == undefined) continue;
				this.drawBondsAsLineSub(geo, atom1, atom2, atom1.bondOrder[_j]);
			}
		}
		var lineMaterial = new THREE.LineBasicMaterial({ linewidth: lineWidth });
		lineMaterial.vertexColors = true;
		var line = new THREE.Line(geo, lineMaterial);
		line.type = THREE.LinePieces;
		group.add(line);
	};

	iview.prototype.drawSmoothCurve = function (group, _points, width, colors, div) {
		if (_points.length == 0) return;
		div = (div == undefined) ? 5 : div;
		var geo = new THREE.Geometry();
		var points = this.subdivide(_points, div);
		for (var i = 0; i < points.length; i++) {
			geo.vertices.push(points[i]);
			geo.colors.push(new THREE.Color(colors[(i == 0) ? 0 : Math.round((i - 1) / div)]));
		}
		var lineMaterial = new THREE.LineBasicMaterial({ linewidth: width });
		lineMaterial.vertexColors = true;
		var line = new THREE.Line(geo, lineMaterial);
		line.type = THREE.LineStrip;
		group.add(line);
	};

	// FIXME: Winkled...
	iview.prototype.drawSmoothTube = function (group, _points, colors, radii) {
		if (_points.length < 2) return;
		var circleDiv = this.tubeDIV, axisDiv = this.axisDIV;
		var geo = new THREE.Geometry();
		var points = this.subdivide(_points, axisDiv);
		var prevAxis1 = new THREE.Vector3(), prevAxis2;
		for (var i = 0, lim = points.length; i < lim; i++) {
			var r, idx = (i - 1) / axisDiv;
			if (i == 0) r = radii[0];
			else {
				if (idx % 1 == 0) r = radii[idx];
				else {
					var floored = Math.floor(idx);
					var tmp = idx - floored;
					r = radii[floored] * tmp + radii[floored + 1] * (1 - tmp);
				}
			}
			var delta, axis1, axis2;
			if (i < lim - 1) {
				delta = new THREE.Vector3().subVectors(points[i], points[i + 1]);
				axis1 = new THREE.Vector3(0, -delta.z, delta.y).normalize().multiplyScalar(r);
				axis2 = new THREE.Vector3().cross(delta, axis1).normalize().multiplyScalar(r);
				//      var dir = 1, offset = 0;
				if (prevAxis1.dot(axis1) < 0) {
					axis1.negate(); axis2.negate();  //dir = -1;//offset = 2 * Math.PI / axisDiv;
				}
				prevAxis1 = axis1; prevAxis2 = axis2;
			} else {
				axis1 = prevAxis1; axis2 = prevAxis2;
			}

			for (var j = 0; j < circleDiv; j++) {
				var angle = 2 * Math.PI / circleDiv * j; //* dir  + offset;
				var c = Math.cos(angle), s = Math.sin(angle);
				geo.vertices.push(new THREE.Vector3(
				points[i].x + c * axis1.x + s * axis2.x,
				points[i].y + c * axis1.y + s * axis2.y,
				points[i].z + c * axis1.z + s * axis2.z));
			}
		}
		var offset = 0;
		for (var i = 0, lim = points.length - 1; i < lim; i++) {
			var c = new THREE.Color(colors[Math.round((i - 1) / axisDiv)]);
			var reg = 0;
			var r1 = new THREE.Vector3().subVectors(geo.vertices[offset], geo.vertices[offset + circleDiv]).lengthSq();
			var r2 = new THREE.Vector3().subVectors(geo.vertices[offset], geo.vertices[offset + circleDiv + 1]).lengthSq();
			if (r1 > r2) { r1 = r2; reg = 1; };
			for (var j = 0; j < circleDiv; j++) {
				geo.faces.push(new THREE.Face3(offset + j, offset + (j + reg) % circleDiv + circleDiv, offset + (j + 1) % circleDiv));
				geo.faces.push(new THREE.Face3(offset + (j + 1) % circleDiv, offset + (j + reg) % circleDiv + circleDiv, offset + (j + reg + 1) % circleDiv + circleDiv));
				geo.faces[geo.faces.length - 2].color = c;
				geo.faces[geo.faces.length - 1].color = c;
			}
			offset += circleDiv;
		}
		geo.computeFaceNormals();
		geo.computeVertexNormals(false);
		var mat = new THREE.MeshLambertMaterial();
		mat.vertexColors = THREE.FaceColors;
		var mesh = new THREE.Mesh(geo, mat);
		mesh.doubleSided = true;
		group.add(mesh);
	};

	iview.prototype.drawMainchainCurve = function (group, atomlist, curveWidth, atomName, div) {
		var points = [], colors = [];
		var currentChain, currentResi;
		if (div == undefined) div = 5;
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom == undefined) continue;

			if ((atom.atom == atomName) && !atom.hetflag) {
				if (currentChain != atom.chain || currentResi + 1 != atom.resi) {
					this.drawSmoothCurve(group, points, curveWidth, colors, div);
					points = [];
					colors = [];
				}
				points.push(new THREE.Vector3(atom.x, atom.y, atom.z));
				colors.push(atom.color);
				currentChain = atom.chain;
				currentResi = atom.resi;
			}
		}
		this.drawSmoothCurve(group, points, curveWidth, colors, div);
	};

	iview.prototype.drawMainchainTube = function (group, atomlist, atomName, radius) {
		var points = [], colors = [], radii = [];
		var currentChain, currentResi;
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom == undefined) continue;
			if ((atom.atom == atomName) && !atom.hetflag) {
				if (currentChain != atom.chain || currentResi + 1 != atom.resi) {
					this.drawSmoothTube(group, points, colors, radii);
					points = []; colors = []; radii = [];
				}
				points.push(new THREE.Vector3(atom.x, atom.y, atom.z));
				if (radius == undefined) {
					radii.push((atom.b > 0) ? atom.b / 100 : 0.3);
				} else {
					radii.push(radius);
				}
				colors.push(atom.color);
				currentChain = atom.chain;
				currentResi = atom.resi;
			}
		}
		this.drawSmoothTube(group, points, colors, radii);
	};

	iview.prototype.drawStrip = function (group, p1, p2, colors, div, thickness) {
		if ((p1.length) < 2) return;
		div = div || this.axisDIV;
		p1 = this.subdivide(p1, div);
		p2 = this.subdivide(p2, div);
		if (!thickness) return this.drawThinStrip(group, p1, p2, colors, div);
		var geo = new THREE.Geometry();
		var vs = geo.vertices, fs = geo.faces;
		var axis, p1v, p2v, a1v, a2v;
		for (var i = 0, lim = p1.length; i < lim; i++) {
			vs.push(p1v = p1[i]); // 0
			vs.push(p1v); // 1
			vs.push(p2v = p2[i]); // 2
			vs.push(p2v); // 3
			if (i < lim - 1) {
				var toNext = p1[i + 1].clone().sub(p1[i]);
				var toSide = p2[i].clone().sub(p1[i]);
				axis = toSide.cross(toNext).normalize().multiplyScalar(thickness);
			}
			vs.push(a1v = p1[i].clone().add(axis)); // 4
			vs.push(a1v); // 5
			vs.push(a2v = p2[i].clone().add(axis)); // 6
			vs.push(a2v); // 7
		}
		var faces = [[0, 2, -6, -8], [-4, -2, 6, 4], [7, 3, -5, -1], [-3, -7, 1, 5]];
		for (var i = 1, lim = p1.length; i < lim; i++) {
			var offset = 8 * i, color = new THREE.Color(colors[Math.round((i - 1) / div)]);
			for (var j = 0; j < 4; j++) {
				var f = new THREE.Face4(offset + faces[j][0], offset + faces[j][1], offset + faces[j][2], offset + faces[j][3], undefined, color);
				fs.push(f);
			}
		}
		var vsize = vs.length - 8; // Cap
		for (var i = 0; i < 4; i++) { vs.push(vs[i * 2]); vs.push(vs[vsize + i * 2]) };
		vsize += 8;
		fs.push(new THREE.Face4(vsize, vsize + 2, vsize + 6, vsize + 4, undefined, fs[0].color));
		fs.push(new THREE.Face4(vsize + 1, vsize + 5, vsize + 7, vsize + 3, undefined, fs[fs.length - 3].color));
		geo.computeFaceNormals();
		geo.computeVertexNormals(false);
		var material = new THREE.MeshLambertMaterial();
		material.vertexColors = THREE.FaceColors;
		var mesh = new THREE.Mesh(geo, material);
		mesh.doubleSided = true;
		group.add(mesh);
	};

	iview.prototype.drawThinStrip = function (group, p1, p2, colors, div) {
		var geo = new THREE.Geometry();
		for (var i = 0, lim = p1.length; i < lim; i++) {
			geo.vertices.push(p1[i]); // 2i
			geo.vertices.push(p2[i]); // 2i + 1
		}
		for (var i = 1, lim = p1.length; i < lim; i++) {
			var f = new THREE.Face4(2 * i, 2 * i + 1, 2 * i - 1, 2 * i - 2);
			f.color = new THREE.Color(colors[Math.round((i - 1) / div)]);
			geo.faces.push(f);
		}
		geo.computeFaceNormals();
		geo.computeVertexNormals(false);
		var material = new THREE.MeshLambertMaterial();
		material.vertexColors = THREE.FaceColors;
		var mesh = new THREE.Mesh(geo, material);
		mesh.doubleSided = true;
		group.add(mesh);
	};

	iview.prototype.IcosahedronGeometry = function () {
		if (!this.icosahedron) this.icosahedron = new THREE.IcosahedronGeometry(1);
		return this.icosahedron;
	};

	iview.prototype.drawCylinder = function (group, from, to, radius, color, cap) {
		if (!from || !to) return;
		var midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
		var color = new THREE.Color(color);
		if (!this.cylinderGeometry) {
			this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, this.cylinderQuality, 1, !cap);
			this.cylinderGeometry.faceUvs = [];
			this.faceVertexUvs = [];
		}
		var cylinderMaterial = new THREE.MeshLambertMaterial({ color: color.getHex() });
		var cylinder = new THREE.Mesh(this.cylinderGeometry, cylinderMaterial);
		cylinder.position = midpoint;
		cylinder.lookAt(from);
		cylinder.updateMatrix();
		cylinder.matrixAutoUpdate = false;
		var m = new THREE.Matrix4().makeScale(radius, radius, from.distanceTo(to));
		m.rotateX(Math.PI / 2);
		cylinder.matrix.multiply(m);
		group.add(cylinder);
	};

	iview.prototype.drawCartoon = function (group, atomlist, doNotSmoothen, thickness) {
		this.drawStrand(group, atomlist, 2, undefined, true, undefined, undefined, doNotSmoothen, thickness);
	};

	iview.prototype.drawStrand = function (group, atomlist, num, div, fill, coilWidth, helixSheetWidth, doNotSmoothen, thickness) {
		num = num || this.strandDIV;
		div = div || this.axisDIV;
		coilWidth = coilWidth || this.coilWidth;
		doNotSmoothen == (doNotSmoothen == undefined) ? false : doNotSmoothen;
		helixSheetWidth = helixSheetWidth || this.helixSheetWidth;
		var points = []; for (var k = 0; k < num; k++) points[k] = [];
		var colors = [];
		var currentChain, currentResi, currentCA;
		var prevCO = null, ss = null, ssborder = false;
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom == undefined) continue;

			if ((atom.atom == 'O' || atom.atom == 'CA') && !atom.hetflag) {
				if (atom.atom == 'CA') {
					if (currentChain != atom.chain || currentResi + 1 != atom.resi) {
						for (var j = 0; !thickness && j < num; j++)
							this.drawSmoothCurve(group, points[j], 1, colors, div);
						if (fill) this.drawStrip(group, points[0], points[num - 1], colors, div, thickness);
						var points = []; for (var k = 0; k < num; k++) points[k] = [];
						colors = [];
						prevCO = null; ss = null; ssborder = false;
					}
					currentCA = new THREE.Vector3(atom.x, atom.y, atom.z);
					currentChain = atom.chain;
					currentResi = atom.resi;
					ss = atom.ss; ssborder = atom.ssstart || atom.ssend;
					colors.push(atom.color);
				} else { // O
					var O = new THREE.Vector3(atom.x, atom.y, atom.z);
					O.sub(currentCA);
					O.normalize(); // can be omitted for performance
					O.multiplyScalar((ss == 'c') ? coilWidth : helixSheetWidth);
					if (prevCO != undefined && O.dot(prevCO) < 0) O.negate();
					prevCO = O;
					for (var j = 0; j < num; j++) {
						var delta = -1 + 2 / (num - 1) * j;
						var v = new THREE.Vector3(currentCA.x + prevCO.x * delta, currentCA.y + prevCO.y * delta, currentCA.z + prevCO.z * delta);
						if (!doNotSmoothen && ss == 's') v.smoothen = true;
						points[j].push(v);
					}
				}
			}
		}
		for (var j = 0; !thickness && j < num; j++)
			this.drawSmoothCurve(group, points[j], 1, colors, div);
		if (fill) this.drawStrip(group, points[0], points[num - 1], colors, div, thickness);
	};

	iview.prototype.drawDottedLines = function (group, points, color) {
		var geo = new THREE.Geometry();
		var step = 0.3;
		for (var i = 0, lim = Math.floor(points.length / 2) ; i < lim; i++) {
			var p1 = points[2 * i], p2 = points[2 * i + 1];
			var delta = p2.clone().sub(p1);
			var dist = delta.length();
			delta.normalize().multiplyScalar(step);
			var jlim = Math.floor(dist / step);
			for (var j = 0; j < jlim; j++) {
				var p = new THREE.Vector3(p1.x + delta.x * j, p1.y + delta.y * j, p1.z + delta.z * j);
				geo.vertices.push(p);
			}
			if (jlim % 2 == 1) geo.vertices.push(p2);
		}
		var mat = new THREE.LineBasicMaterial({ 'color': color.getHex() });
		mat.linewidth = 2;
		var line = new THREE.Line(geo, mat, THREE.LinePieces);
		group.add(line);
	};

	iview.prototype.getAllAtoms = function () {
		var ret = [];
		for (var i in this.atoms) {
			ret.push(this.atoms[i].serial);
		}
		return ret;
	};

	iview.prototype.getSidechains = function (atomlist) {
		var ret = [];
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom.hetflag) continue;
			if (atom.atom == 'C' || atom.atom == 'O' || (atom.atom == 'N' && atom.resn != "PRO")) continue;
			ret.push(atom.serial);
		}
		return ret;
	};

	iview.prototype.getHetatms = function (atomlist) {
		var ret = [];
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom.hetflag) ret.push(atom.serial);
		}
		return ret;
	};

	iview.prototype.getLigands = function (atomlist) {
		var ret = [];
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom.bonds.length) ret.push(atom.serial);
		}
		return ret;
	};

	iview.prototype.getWaters = function (atomlist) {
		var ret = [];
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom.bonds.length == 0 && atom.resn == 'HOH') ret.push(atom.serial);
		}
		return ret;
	};

	iview.prototype.getIons = function (atomlist) {
		var ret = [];
		for (var i in atomlist) {
			var atom = this.atoms[atomlist[i]];
			if (atom.bonds.length == 0 && atom.resn != 'HOH') ret.push(atom.serial);
		}
		return ret;
	};

	iview.prototype.rebuildScene = function (options) {
		var view;
		if (!this.modelGroup) view = [0, 0, 0, 0, 0, 0, 0, 1];
		else {
			var pos = this.modelGroup.position;
			var q = this.rotationGroup.quaternion;
			view = [pos.x, pos.y, pos.z, this.rotationGroup.position.z, q.x, q.y, q.z, q.w];
		}
		// this.scene.deallocateObject();
		this.scene = new THREE.Scene();
		this.modelGroup = new THREE.Object3D();
		this.rotationGroup = new THREE.Object3D();
		this.rotationGroup.useQuaternion = true;
		this.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0);
		this.rotationGroup.add(this.modelGroup);
		this.scene.add(this.rotationGroup);
		var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
		directionalLight.position = new THREE.Vector3(0.2, 0.2, -1).normalize();
		directionalLight.intensity = 1.2;
		this.scene.add(directionalLight);
		var ambientLight = new THREE.AmbientLight(0x202020);
		this.scene.add(ambientLight);

		$.extend(this.options, options);
		this.camera = this.cameras[this.options.camera];
		var bgColor = this.backgroundColors[this.options.background] || this.options.background;
		this.renderer.setClearColorHex(bgColor, 1.0);
		this.scene.fog = new THREE.Fog(bgColor, 100, 200);
		this.colorBy[this.options.colorBy]();
		var target = this.modelGroup;
		var all = this.getAllAtoms();
		var doNotSmoothen = false; // Don't smoothen beta-sheets in ribbons
		switch (this.options.secondaryStructure) {
			case 'thick ribbon':
				this.drawCartoon(target, all, doNotSmoothen, this.thickness);
				break;
			case 'thin ribbon':
				this.drawCartoon(target, all, doNotSmoothen);
				break;
			case 'strand':
				this.drawStrand(target, all, null, null, null, null, null, doNotSmoothen);
				break;
			case 'C alpha trace':
				this.drawMainchainCurve(target, all, this.curveWidth, 'CA', 1);
				break;
			case 'B factor tube':
				this.drawMainchainTube(target, all, 'CA');
				break;
		}
		switch (this.options.primaryStructure) {
			case 'residues':
				this.drawBondsAsLine(target, all, this.lineWidth);
				break;
			case 'sidechains':
				this.drawBondsAsLine(target, this.getSidechains(all), this.lineWidth);
				break;
		}
		var hetatms = this.getHetatms(all);
		var ligands = this.getLigands(hetatms);
		switch (this.options.ligands) {
			case 'line':
				this.drawBondsAsLine(target, ligands, this.curveWidth);
				break;
			case 'stick':
				this.drawBondsAsStick(target, ligands, this.cylinderRadius, this.cylinderRadius, true);
				break;
			case 'ball and stick':
				this.drawBondsAsStick(target, ligands, this.cylinderRadius / 2.0, this.cylinderRadius, true, false, 0.3);
				break;
			case 'ball and stick (multiple bonds)':
//				this.drawBondsAsStick(target, ligands, this.cylinderRadius / 2.0, this.cylinderRadius, true, true, 0.3);
				break;
			case 'sphere':
				this.drawAtomsAsSphere(target, ligands, this.sphereRadius);
				break;
		}
		var waters = this.getWaters(hetatms);
		switch (this.options.waters) {
			case 'sphere':
				this.drawAtomsAsSphere(target, waters, this.sphereRadius, true);
				break;
		}
		var ions = this.getIons(hetatms);
		switch (this.options.ions) {
			case 'sphere':
				this.drawAtomsAsSphere(target, ions, this.sphereRadius);
				break;
		}
		if (!this.modelGroup || !this.rotationGroup) return;
		this.modelGroup.position.x = view[0];
		this.modelGroup.position.y = view[1];
		this.modelGroup.position.z = view[2];
		this.rotationGroup.position.z = view[3];
		this.rotationGroup.quaternion.x = view[4];
		this.rotationGroup.quaternion.y = view[5];
		this.rotationGroup.quaternion.z = view[6];
		this.rotationGroup.quaternion.w = view[7];
		this.show();
	};

	iview.prototype.loadReceptor = function (src) {
		this.atoms = [];
		lines = src.split('\n');
		for (var i = 0; i < lines.length; i++) {
			line = lines[i];
			if (line.match('^ATOM|HETATM')) {
				var serial = parseInt(line.substr(6, 5));
				this.atoms[serial] = {
					hetflag: line[0] == 'H',
					serial: serial,
					atom: line.substr(12, 4).replace(/ /g, ''),
					resn: line.substr(17, 3),
					chain: line.substr(21, 1),
					resi: parseInt(line.substr(22, 5)),
					x: parseFloat(line.substr(30, 8)),
					y: parseFloat(line.substr(38, 8)),
					z: parseFloat(line.substr(46, 8)),
					b: parseFloat(line.substr(60, 8)),
					elem: line.substr(77, 2),
					color: null,
					bonds: [],
					bondOrder: [],
				};
			}
		}
		this.rebuildScene();
		this.resetView();
	};

	iview.prototype.show = function () {
		if (!this.scene) return;
		var center = this.rotationGroup.position.z - this.camera.position.z;
		if (center < 1) center = 1;
		this.camera.near = center + this.slabNear;
		if (this.camera.near < 1) this.camera.near = 1;
		this.camera.far = center + this.slabFar;
		if (this.camera.near + 1 > this.camera.far) this.camera.far = this.camera.near + 1;
		if (this.camera instanceof THREE.PerspectiveCamera) {
			this.camera.fov = this.fov;
		} else {
			this.camera.right = center * Math.tan(Math.PI / 180 * this.fov);
			this.camera.left = -this.camera.right;
			this.camera.top = this.camera.right / this.ASPECT;
			this.camera.bottom = -this.camera.top;
		}
		this.camera.updateProjectionMatrix();
		this.scene.fog.near = this.camera.near + this.fogStart * (this.camera.far - this.camera.near);
		//   if (this.scene.fog.near > center) this.scene.fog.near = center;
		this.scene.fog.far = this.camera.far;
		this.renderer.render(this.scene, this.camera);
	};

	iview.prototype.resetView = function () {
		var xmin = ymin = zmin = 9999;
		var xmax = ymax = zmax = -9999;
		var xsum = ysum = zsum = cnt = 0;
		for (var i in this.atoms) {
			var atom = this.atoms[i];
			xsum += atom.x; ysum += atom.y; zsum += atom.z;
			xmin = (xmin < atom.x) ? xmin : atom.x;
			ymin = (ymin < atom.y) ? ymin : atom.y;
			zmin = (zmin < atom.z) ? zmin : atom.z;
			xmax = (xmax > atom.x) ? xmax : atom.x;
			ymax = (ymax > atom.y) ? ymax : atom.y;
			zmax = (zmax > atom.z) ? zmax : atom.z;
			++cnt;
		}
		var center = new THREE.Vector3(xsum / cnt, ysum / cnt, zsum / cnt);//(xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2
		this.modelGroup.position = center.multiplyScalar(-1);
		var x = xmax - xmin, y = ymax - ymin, z = zmax - zmin;
		var maxD = Math.sqrt(x * x + y * y + z * z);
		if (maxD < 25) maxD = 25;
		this.slabNear = -maxD / 1.9;
		this.slabFar = maxD / 3;
		this.rotationGroup.position.z = maxD * 0.35 / Math.tan(Math.PI / 180.0 * this.camera.fov / 2) - 150;
		this.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0);
		this.show();
	};

	iview.prototype.export = function () {
		this.show();
		window.open(this.renderer.domElement.toDataURL('image/png'));
	};

	return iview;
}());
