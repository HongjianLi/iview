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

	function Element(ad, color, covalentRadius) {
		this.ad = ad;
		this.color = color;
		this.covalentRadius = covalentRadius;
	}

	E = [];
	E['H' ] = new Element( 0, '#FFFFFF', 0.407);
	E['HD'] = new Element( 1, '#FFFFFF', 0.407);
	E['C' ] = new Element( 2, '#909090', 0.847);
	E['A' ] = new Element( 3, '#909090', 0.847);
	E['N' ] = new Element( 4, '#3050F8', 0.825);
	E['NA'] = new Element( 5, '#3050F8', 0.825);
	E['OA'] = new Element( 6, '#FF0D0D', 0.803);
	E['S' ] = new Element( 7, '#FFFF30', 1.122);
	E['SA'] = new Element( 8, '#FFFF30', 1.122);
	E['Se'] = new Element( 9, '#FFA100', 1.276);
	E['P' ] = new Element(10, '#FF8000', 1.166);
	E['F' ] = new Element(11, '#90E050', 0.781);
	E['Cl'] = new Element(12, '#1FF01F', 1.089);
	E['Br'] = new Element(13, '#A62929', 1.254);
	E['I' ] = new Element(14, '#940094', 1.463);
	E['Zn'] = new Element(15, '#7D80B0', 1.441);
	E['Fe'] = new Element(16, '#E06633', 1.375);
	E['Mg'] = new Element(17, '#8AFF00', 1.430);
	E['Ca'] = new Element(18, '#3DFF00', 1.914);
	E['Mn'] = new Element(19, '#9C7AC7', 1.529);
	E['Cu'] = new Element(20, '#C88033', 1.518);
	E['Na'] = new Element(21, '#AB5CF2', 1.694);
	E['K' ] = new Element(22, '#8F40D4', 2.156);
	E['Hg'] = new Element(23, '#B8B8D0', 1.639);
	E['Ni'] = new Element(24, '#50D050', 1.331);
	E['Co'] = new Element(25, '#F090A0', 1.386);
	E['Cd'] = new Element(26, '#FFD98F', 1.628);
	E['As'] = new Element(27, '#BD80E3', 1.309);
	E['Sr'] = new Element(28, '#00FF00', 2.112);

	Atom = function(coord, type) {
		vec3.set(coord, this);
		this.type = type;
		this.isHBD = function() {
			return (this.type == 'HD') || (this.ad >= 15);
		}
		this.isHBA = function() {
			return (this.type == 'NA') || (this.type == 'OA') || (this.type == 'SA');
		}
		this.render = function(gl) {
			gl.material.setDiffuseColor(E[this.type].color);
			gl.setMatrixUniforms(mat4.scale(mat4.translate(gl.modelViewMatrix, this, []), [ .3, .3, .3 ], []));
			gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		};
	};

	Bond = function(a1, a2) {
		this.a1 = a1;
		this.a2 = a2;
		this.render = function(gl) {
			var ang = 0;
			var axis = [ 0, 0, 1 ];
			if (this.a1[0] == this.a2[0] && this.a1[2] == this.a2[2]) {
				if (this.a2[1] < this.a1[1]) {
					ang = Math.PI;
				}
			} else {
				var y = [ 0, 1, 0 ];
				var a1m = vec3.scale(vec3.subtract(this.a2, this.a1, []), .5, []);
				ang = Math.acos(vec3.dot(y, a1m) / vec3.length(a1m));
				axis = vec3.cross(y, a1m, []);
			}
			var scaleVector = [ .3, vec3.dist(this.a1, this.a2) * .5, .3 ];
			// Draw one half.
			gl.material.setDiffuseColor(E[this.a1.type].color);
			gl.setMatrixUniforms(mat4.scale(mat4.rotate(mat4.translate(gl.modelViewMatrix, this.a1, []), ang, axis, []), scaleVector, []));
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
			// Draw the other half.
			gl.material.setDiffuseColor(E[this.a2.type].color);
			gl.setMatrixUniforms(mat4.scale(mat4.rotate(mat4.translate(gl.modelViewMatrix, this.a2, []), ang + Math.PI, axis, []), scaleVector, []));
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
		};
	};

	HBond = function(a1, a2) {
		this.a1 = a1;
		this.a2 = a2;
		this.render = function(gl) {
			var ang = 0;
			var axis = [ 0, 0, 1 ];
			if (this.a1[0] == this.a2[0] && this.a1[2] == this.a2[2]) {
				if (this.a2[1] < this.a1[1]) {
					ang = Math.PI;
				}
			} else {
				var y = [ 0, 1, 0 ];
				var a1a2 = vec3.subtract(this.a2, this.a1, []);
				ang = Math.acos(vec3.dot(y, a1a2) / vec3.length(a1a2));
				axis = vec3.cross(y, a1a2, []);
			}
			gl.setMatrixUniforms(mat4.scale(mat4.rotate(mat4.translate(gl.modelViewMatrix, this.a1, []), ang, axis, []), [ .05, vec3.dist(this.a1, this.a2), .05 ], []));
			gl.material.setDiffuseColor('#33FF33');
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
		};
	};

	Molecule = function() {
		this.atoms = [];
		this.bonds = [];
	};

	Mesh = function() {
	};
	Mesh.prototype.createBuffers = function(gl, positionData, normalData, indexData) {
		this.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = positionData.length / 3;

		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = normalData.length / 3;
			
		if (indexData) {
			this.vertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
			this.vertexIndexBuffer.itemSize = 1;
			this.vertexIndexBuffer.numItems = indexData.length;
		}
	};
	Mesh.prototype.bindBuffers = function(gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		gl.vertexAttribPointer(gl.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.vertexAttribPointer(gl.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		if (this.vertexIndexBuffer) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		}
	};

	Sphere = function(gl, latitudeBands, longitudeBands) {
		var positionData = [];
		var normalData = [];
		var latitudeAngle = Math.PI / latitudeBands;
		var longitudeAngle = 2 * Math.PI / longitudeBands;
		for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
			var theta = latitudeAngle * latNumber;
			var sinTheta = Math.sin(theta);
			var y = Math.cos(theta);
			for (var longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
				var phi = longitudeAngle * longNumber;
				var x = Math.cos(phi) * sinTheta;
				var z = Math.sin(phi) * sinTheta;
				normalData.push(x, y, z);
				positionData.push(x, y, z);
			}
		}

		var indexData = [];
		longitudeBands += 1;
		for (var latNumber = 0; latNumber < latitudeBands; ++latNumber) {
			for (var longNumber = 0; longNumber < longitudeBands; ++longNumber) {
				var first = (latNumber * longitudeBands) + longNumber;
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

		this.createBuffers(gl, positionData, normalData, indexData);
	};
	Sphere.prototype = new Mesh();

	Cylinder = function(gl, height, bands) {
		var positionData = [];
		var normalData = [];
		var angle = 2 * Math.PI / bands;
		for (var i = 0; i < bands; ++i) {
			var theta = angle * i;
			var cosTheta = Math.cos(theta);
			var sinTheta = Math.sin(theta);
			normalData.push(cosTheta, 0, sinTheta);
			positionData.push(cosTheta, 0, sinTheta);
			normalData.push(cosTheta, 0, sinTheta);
			positionData.push(cosTheta, height, sinTheta);
		}
		normalData.push(1, 0, 0);
		positionData.push(1, 0, 0);
		normalData.push(1, 0, 0);
		positionData.push(1, height, 0);

		this.createBuffers(gl, positionData, normalData);
	};
	Cylinder.prototype = new Mesh();

	Material = function(gl) {
		var aUL = gl.getUniformLocation(gl.program, 'u_material.ambient_color');
		var dUL = gl.getUniformLocation(gl.program, 'u_material.diffuse_color');
		var sUL = gl.getUniformLocation(gl.program, 'u_material.specular_color');
		var snUL = gl.getUniformLocation(gl.program, 'u_material.shininess');
		var alUL = gl.getUniformLocation(gl.program, 'u_material.alpha');
		var ambientColor = '#000000';
		gl.uniform3f(aUL, parseInt(ambientColor.substring(1, 3), 16) / 255.0, parseInt(ambientColor.substring(3, 5), 16) / 255.0, parseInt(ambientColor.substring(5, 7), 16) / 255.0);
		var specularColor = '#555555';
		gl.uniform3f(sUL, parseInt(specularColor.substring(1, 3), 16) / 255.0, parseInt(specularColor.substring(3, 5), 16) / 255.0, parseInt(specularColor.substring(5, 7), 16) / 255.0);
		gl.uniform1f(snUL, 32);
		gl.uniform1f(alUL, 1);
		this.dCache = null;
		this.setDiffuseColor = function(diffuseColor) {
			if (this.dCache != diffuseColor) {
				this.dCache = diffuseColor;
				gl.uniform3f(dUL, parseInt(diffuseColor.substring(1, 3), 16) / 255.0, parseInt(diffuseColor.substring(3, 5), 16) / 255.0, parseInt(diffuseColor.substring(5, 7), 16) / 255.0);
			}
		};
	};

	monitor = {};
	monitor.CANVAS_DRAGGING = null;
	monitor.CANVAS_OVER = null;
	monitor.ALT = false;
	monitor.SHIFT = false;
	monitor.META = false;

	var doc = $(document);
	doc.ready(function() {
		// handles dragging beyond the canvas bounds
		doc.mousemove(function(e) {
			if (monitor.CANVAS_DRAGGING != null) {
				if (monitor.CANVAS_DRAGGING.drag) {
					monitor.CANVAS_DRAGGING.prehandleEvent(e);
					monitor.CANVAS_DRAGGING.drag(e);
				}
			}
		});
		doc.mouseup(function(e) {
			if (monitor.CANVAS_DRAGGING != null && monitor.CANVAS_DRAGGING != monitor.CANVAS_OVER) {
				if (monitor.CANVAS_DRAGGING.mouseup) {
					monitor.CANVAS_DRAGGING.prehandleEvent(e);
					monitor.CANVAS_DRAGGING.mouseup(e);
				}
			}
			monitor.CANVAS_DRAGGING = null;
		});
		// handles modifier keys from a single keyboard
		doc.keydown(function(e) {
			monitor.SHIFT = e.shiftKey;
			monitor.ALT = e.altKey;
			monitor.META = e.metaKey;
			var affecting = monitor.CANVAS_OVER;
			if (monitor.CANVAS_DRAGGING != null) {
				affecting = monitor.CANVAS_DRAGGING;
			}
			if (affecting != null) {
				if (affecting.keydown) {
					affecting.prehandleEvent(e);
					affecting.keydown(e);
				}
			}
		});
		doc.keypress(function(e) {
			var affecting = monitor.CANVAS_OVER;
			if (monitor.CANVAS_DRAGGING != null) {
				affecting = monitor.CANVAS_DRAGGING;
			}
			if (affecting != null) {
				if (affecting.keypress) {
					affecting.prehandleEvent(e);
					affecting.keypress(e);
				}
			}
		});
		doc.keyup(function(e) {
			monitor.SHIFT = e.shiftKey;
			monitor.ALT = e.altKey;
			monitor.META = e.metaKey;
			var affecting = monitor.CANVAS_OVER;
			if (monitor.CANVAS_DRAGGING != null) {
				affecting = monitor.CANVAS_DRAGGING;
			}
			if (affecting != null) {
				if (affecting.keyup) {
					affecting.prehandleEvent(e);
					affecting.keyup(e);
				}
			}
		});
	});

	var iview = function(id) {
		// setup input events
		// make sure prehandle events are only in if statements if handled, so
		// as not to block browser events
		this.canvas = $('#' + id);
		var me = this;
		this.canvas.click(function(e) {
			switch (e.which) {
			case 1: // left button
				if (me.click) {
					me.prehandleEvent(e);
					me.click(e);
				}
				break;
			case 2: // middle button
				if (me.middleclick) {
					me.prehandleEvent(e);
					me.middleclick(e);
				}
				break;
			case 3: // right button
				if (me.rightclick) {
					me.prehandleEvent(e);
					me.rightclick(e);
				}
				break;
			}
		});
		this.canvas.dblclick(function(e) {
			if (me.dblclick) {
				me.prehandleEvent(e);
				me.dblclick(e);
			}
		});
		this.canvas.mousedown(function(e) {
			switch (e.which) {
			case 1: // left button
				monitor.CANVAS_DRAGGING = me;
				if (me.mousedown) {
					me.prehandleEvent(e);
					me.mousedown(e);
				}
				break;
			case 2: // middle button
				if (me.middlemousedown) {
					me.prehandleEvent(e);
					me.middlemousedown(e);
				}
				break;
			case 3: // right button
				if (me.rightmousedown) {
					me.prehandleEvent(e);
					me.rightmousedown(e);
				}
				break;
			}
		});
		this.canvas.mousemove(function(e) {
			if (monitor.CANVAS_DRAGGING == null && me.mousemove) {
				me.prehandleEvent(e);
				me.mousemove(e);
			}
		});
		this.canvas.mouseout(function(e) {
			monitor.CANVAS_OVER = null;
			if (me.mouseout) {
				me.prehandleEvent(e);
				me.mouseout(e);
			}
		});
		this.canvas.mouseover(function(e) {
			monitor.CANVAS_OVER = me;
			if (me.mouseover) {
				me.prehandleEvent(e);
				me.mouseover(e);
			}
		});
		this.canvas.mouseup(function(e) {
			switch (e.which) {
			case 1: // left button
				if (me.mouseup) {
					me.prehandleEvent(e);
					me.mouseup(e);
				}
				break;
			case 2: // middle button
				if (me.middlemouseup) {
					me.prehandleEvent(e);
					me.middlemouseup(e);
				}
				break;
			case 3: // right button
				if (me.rightmouseup) {
					me.prehandleEvent(e);
					me.rightmouseup(e);
				}
				break;
			}
		});
		this.canvas.mousewheel(function(e, delta) {
			if (me.mousewheel) {
				me.prehandleEvent(e);
				me.mousewheel(e, delta);
			}
		});
		// Setup WebGL
		var domCanvas = this.canvas.get(0);
		var gl = domCanvas.getContext('webgl');
		if (!gl) {
			gl = domCanvas.getContext('experimental-webgl');
		}
		gl.clearColor(1, 1, 1, 1.0);
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.program = gl.createProgram();
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
		gl.vertexPositionAttribute = gl.getAttribLocation(gl.program, 'a_vertex_position');
		gl.enableVertexAttribArray(gl.vertexPositionAttribute);
		gl.vertexNormalAttribute = gl.getAttribLocation(gl.program, 'a_vertex_normal');
		gl.enableVertexAttribArray(gl.vertexNormalAttribute);
		gl.sphereBuffer = new Sphere(gl, 60, 60);
		gl.cylinderBuffer = new Cylinder(gl, 1, 60);
		gl.material = new Material(gl);
		gl.uniform3f(gl.getUniformLocation(gl.program, 'u_light.diffuse_color'), 1, 1, 1);
		gl.uniform3f(gl.getUniformLocation(gl.program, 'u_light.specular_color'), 1, 1, 1);
		gl.uniform3f(gl.getUniformLocation(gl.program, 'u_light.direction'), .1, .1, 1);
		gl.uniform3f(gl.getUniformLocation(gl.program, 'u_light.half_vector'), .1, .1, 1);
		gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_projection_matrix'), false, mat4.perspective(45, this.canvas.attr('width') / this.canvas.attr('height'), .1, 10000));
		this.rotationMatrix = mat4.identity();
		this.translationMatrix = mat4.identity();
		var mvUL = gl.getUniformLocation(gl.program, 'u_model_view_matrix');
		var nUL = gl.getUniformLocation(gl.program, 'u_normal_matrix');
		gl.setMatrixUniforms = function(mvMatrix) {
			this.uniformMatrix4fv(mvUL, false, mvMatrix);
			this.uniformMatrix3fv(nUL, false, mat3.transpose(mat4.toInverseMat3(mvMatrix, []), []));
		};
		this.gl = gl;
	};
	iview.prototype.setBox = function(center, size) {
		this.center = center;
		this.size = size;
		var half = vec3.scale(size, .5, []);
		this.corner1 = vec3.subtract(center, half, []);
		this.corner2 = vec3.add(center, half, []);
		this.maxDimension = Math.max(size[0], size[1]);
		this.translationMatrix = mat4.translate(mat4.identity(), [ 0, 0, -this.maxDimension ]);
	}
	iview.prototype.parseReceptor = function(content) {
		var residues = [], atoms = [];
		for ( var residue = 'XXXX', lines = content.split('\n'), ii = lines.length, i = 0; i < ii; i++) {
			var line = lines[i];
			if (line.match('^ATOM|HETATM')) {
				if ((line[25] != residue[3]) || (line[24] != residue[2]) || (line[23] != residue[1]) || (line[22] != residue[0])) {
					residue = line.substring(22, 26);
					residues.push(atoms.length);
				}
				// Hide nonpolar hydrogens
				atoms.push(new Atom([parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54))], $.trim(line.substring(77, 79))));
			} else if (line.match('^TER')) {
				residue = 'XXXX';
			}
		}
		residues.push(atoms.length);
		this.receptor = new Molecule();
		for ( var r = 0, rr = residues.length - 1; r < rr; r++) {
			var inside = false;
			for ( var i = residues[r], ii = residues[r + 1]; i < ii; i++ ) {
				var a = atoms[i];
				if ((this.corner1[0] <= a[0]) && (a[0] < this.corner2[0]) && (this.corner1[1] <= a[1]) && (a[1] < this.corner2[1]) && (this.corner1[2] <= a[2]) && (a[2] < this.corner2[2])) {
					inside = true;
					break;
				}
			}
			if (!inside) continue;
			for ( var i = residues[r], ii = residues[r + 1]; i < ii; i++ ) {
				var a1 = atoms[i];
				this.receptor.atoms.push(a1);
				for ( var j = i + 1; j < ii; j++) {
					var a2 = atoms[j];
					if (vec3.dist(a1, a2) < E[a1.type].covalentRadius + E[a2.type].covalentRadius) {
						this.receptor.bonds.push(new Bond(a1, a2));
					}
				}
			}
		}
		for ( var i = 0, ii = this.receptor.atoms.length; i < ii; i++) {
			vec3.subtract(this.receptor.atoms[i], this.center);
		}
	};
	iview.prototype.parseLigand = function(content) {
		this.ligand = new Molecule();
		var frames = [0], rotorXes = [], rotorYes = [], serials = [];
		for ( var lines = content.split('\n'), ii = lines.length, i = 0; i < ii; i++) {
			var line = lines[i];
			if (line.match('^ATOM|HETATM')) {
				// Hide nonpolar hydrogens
				this.ligand.atoms.push(new Atom([parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54))], $.trim(line.substring(77, 79))));
			} else if (line.match('^BRANCH')) {
				frames.push(this.ligand.atoms.length);
				rotorXes.push(parseInt(line.substring( 6, 10)));
				rotorYes.push(parseInt(line.substring(10, 14)));
			}
		}
		frames.push(this.ligand.atoms.length);
		for (var f = 0, ff = frames.length - 1; f < ff; f++) {
			for ( var i = frames[f], ii = frames[f + 1]; i < ii; i++ ) {
				var a1 = this.ligand.atoms[i];
				for ( var j = i + 1; j < ii; j++) {
					var a2 = this.ligand.atoms[j];
					if (vec3.dist(a1, a2) < E[a1.type].covalentRadius + E[a2.type].covalentRadius) {
						this.ligand.bonds.push(new Bond(a1, a2));
					}
				}
			}
		}
		for (var i = 0, ii = rotorXes.length; i < ii; i++) {
			this.ligand.bonds.push(new Bond(this.ligand.atoms[rotorXes[i] - 1], this.ligand.atoms[rotorYes[i] - 1]));
		}
		for ( var i = 0, ii = this.ligand.atoms.length; i < ii; i++) {
			vec3.subtract(this.ligand.atoms[i], this.center);
		}
		this.hbonds = [];
		for (var i = 0, ii = this.receptor.atoms.length; i < ii; i++) {
			for (var j = 0, jj = this.ligand.atoms.length; j < jj; j++) {
				if (((this.receptor.atoms[i].isHBD() && this.ligand.atoms[j].isHBA()) || (this.receptor.atoms[i].isHBA() && this.ligand.atoms[j].isHBD())) && (vec3.dist(this.receptor.atoms[i], this.ligand.atoms[j]) < 3.5)) { // Consider distance
					this.hbonds.push(new HBond(this.receptor.atoms[i], this.ligand.atoms[j]));
				}
			}
		}
	}
	iview.prototype.prehandleEvent = function(e) {
		e.preventDefault();
		e.offset = this.canvas.offset();
		e.p = [ e.pageX - e.offset.left, e.pageY - e.offset.top ];
	};
	iview.prototype.repaint = function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.modelViewMatrix = mat4.multiply(this.translationMatrix, this.rotationMatrix, []);
		this.gl.rotationMatrix = this.rotationMatrix;
		// Draw atoms.
		this.gl.sphereBuffer.bindBuffers(this.gl);
		for ( var i = 0, ii = this.receptor.atoms.length; i < ii; i++) {
			this.receptor.atoms[i].render(this.gl);
		}
		for ( var i = 0, ii = this.ligand.atoms.length; i < ii; i++) {
			this.ligand.atoms[i].render(this.gl);
		}
		// Draw bonds.
		this.gl.cylinderBuffer.bindBuffers(this.gl);
		for ( var i = 0, ii = this.receptor.bonds.length; i < ii; i++) {
			this.receptor.bonds[i].render(this.gl);
		}
		for ( var i = 0, ii = this.ligand.bonds.length; i < ii; i++) {
			this.ligand.bonds[i].render(this.gl);
		}
		for ( var i = 0, ii = this.hbonds.length; i < ii; i++) {
			this.hbonds[i].render(this.gl);
		}
		this.gl.flush();
	};
	iview.prototype.mousedown = function(e) {
		this.lastPoint = e.p;
	};
	iview.prototype.rightmousedown = function(e) {
		this.lastPoint = e.p;
	};
	iview.prototype.drag = function(e) {
		var difx = e.p[0] - this.lastPoint[0];
		var dify = e.p[1] - this.lastPoint[1];
		this.lastPoint = e.p;
		if (monitor.ALT) {
			mat4.translate(this.translationMatrix, [ difx / 20, -dify / 20, 0 ]);
		} else {
			var rotation = mat4.rotate(mat4.identity(), difx * Math.PI / 180.0, [ 0, 1, 0 ]);
			mat4.rotate(rotation, dify * Math.PI / 180.0, [ 1, 0, 0 ]);
			this.rotationMatrix = mat4.multiply(rotation, this.rotationMatrix);
		}
		this.repaint();
	};
	iview.prototype.mousewheel = function(e, delta) {
		mat4.translate(this.translationMatrix, [ 0, 0, delta * this.maxDimension / 8 ]);
		this.repaint();
	};

	return iview;

})();
