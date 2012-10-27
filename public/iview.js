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

	iview.getRGB = function(color) {
		return [ parseInt(color.substring(1, 3), 16) / 255.0, parseInt(color.substring(3, 5), 16) / 255.0, parseInt(color.substring(5, 7), 16) / 255.0 ];
	};

	function Element(color, covalentRadius) {
		this.color = color;
		this.covalentRadius = covalentRadius;
	}

	iview.ELEMENT = [];
	iview.ELEMENT['H' ] = new Element('#FFFFFF', 0.407);
	iview.ELEMENT['C' ] = new Element('#909090', 0.847);
	iview.ELEMENT['N' ] = new Element('#3050F8', 0.825);
	iview.ELEMENT['O' ] = new Element('#FF0D0D', 0.803);
	iview.ELEMENT['S' ] = new Element('#FFFF30', 1.122);
	iview.ELEMENT['Se'] = new Element('#FFA100', 1.276);
	iview.ELEMENT['P' ] = new Element('#FF8000', 1.166);
	iview.ELEMENT['F' ] = new Element('#90E050', 0.781);
	iview.ELEMENT['Cl'] = new Element('#1FF01F', 1.089);
	iview.ELEMENT['Br'] = new Element('#A62929', 1.254);
	iview.ELEMENT['I' ] = new Element('#940094', 1.463);
	iview.ELEMENT['Zn'] = new Element('#7D80B0', 1.441);
	iview.ELEMENT['Fe'] = new Element('#E06633', 1.375);
	iview.ELEMENT['Mg'] = new Element('#8AFF00', 1.430);
	iview.ELEMENT['Ca'] = new Element('#3DFF00', 1.914);
	iview.ELEMENT['Mn'] = new Element('#9C7AC7', 1.529);
	iview.ELEMENT['Cu'] = new Element('#C88033', 1.518);
	iview.ELEMENT['Na'] = new Element('#AB5CF2', 1.694);
	iview.ELEMENT['K' ] = new Element('#8F40D4', 2.156);
	iview.ELEMENT['Hg'] = new Element('#B8B8D0', 1.639);
	iview.ELEMENT['Ni'] = new Element('#50D050', 1.331);
	iview.ELEMENT['Co'] = new Element('#F090A0', 1.386);
	iview.ELEMENT['Cd'] = new Element('#FFD98F', 1.628);
	iview.ELEMENT['As'] = new Element('#BD80E3', 1.309);
	iview.ELEMENT['Sr'] = new Element('#00FF00', 2.112);

/* Uncomment these lines to substitute PyMOL colors
	iview.ELEMENT['H'].color = '#E6E6E6';
	iview.ELEMENT['C'].color = '#33FF33';
	iview.ELEMENT['N'].color = '#3333FF';
	iview.ELEMENT['O'].color = '#FF4D4D';
	iview.ELEMENT['F'].color = '#B3FFFF';
	iview.ELEMENT['S'].color = '#E6C640';
*/

	iview.Atom = function(label, x, y, z) {
		this.label = label;
		this.x = x;
		this.y = y;
		this.z = z;
		this.bondNumber = 0;
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
			ctx.font = specs.getFontString(specs.atoms_font_size_2D, specs.atoms_font_families_2D, specs.atoms_font_bold_2D, specs.atoms_font_italic_2D);
			ctx.fillStyle = iview.ELEMENT[this.label].color;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(this.label, this.x, this.y);
		};
		this.render = function(gl, specs) {
			var transform = mat4.translate(gl.modelViewMatrix, [ this.x, this.y, this.z ], []);
			var radius = specs.atoms_sphereRadius_3D;
			mat4.scale(transform, [ radius, radius, radius ]);
			gl.material.setDiffuseColor(iview.ELEMENT[this.label].color);
			gl.setMatrixUniforms(transform);
			gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		};
	};

	iview.Bond = function(a1, a2) {
		this.a1 = a1;
		this.a2 = a2;
		this.getLength3D = function() {
			return this.a1.distance3D(this.a2);
		};
		this.render = function(gl, specs) {
			// this is the elongation vector for the cylinder
			var scaleVector = [ specs.bonds_cylinderRadius_3D, 1.001 * this.a1.distance3D(this.a2) / 2, specs.bonds_cylinderRadius_3D ];
			// transform to the atom as well as the opposite atom
			var transform = mat4.translate(gl.modelViewMatrix, [ this.a1.x, this.a1.y, this.a1.z ], []);
			// align bond
			var a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
			vec3.scale(a2b, .5);
			var transformOpposite = mat4.translate(gl.modelViewMatrix, [ this.a2.x, this.a2.y, this.a2.z ], []);
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
				ang = Math.acos(vec3.dot(y, a2b) / vec3.length(y) / vec3.length(a2b));
				axis = vec3.cross(y, a2b, []);
			}
			var transformUse = mat4.set(transform, []);
			if (ang != 0) {
				mat4.rotate(transformUse, ang, axis);
			}
			mat4.scale(transformUse, scaleVector);
			var color = iview.ELEMENT[this.a1.label].color;
			gl.material.setDiffuseColor(color);
			gl.setMatrixUniforms(transformUse);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
			mat4.set(transformOpposite, transformUse);
			// don't check for 0 here as that means it should be rotated
			// by PI, but PI will be negated
			mat4.rotate(transformUse, ang + Math.PI, axis);
			mat4.scale(transformUse, scaleVector);
			gl.material.setDiffuseColor(iview.ELEMENT[this.a2.label].color);
			gl.setMatrixUniforms(transformUse);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
		};
	};

	iview.Molecule = function() {
		this.atoms = [];
		this.bonds = [];
		this.draw = function(ctx, specs) {
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				this.atoms[i].draw(ctx, specs);
			}
			for ( var i = 0, ii = this.bonds.length; i < ii; i++) {
				this.bonds[i].draw(ctx, specs);
			}
		};
		this.render = function(gl, specs) {
			if (this.bonds.length > 0) {
				gl.cylinderBuffer.bindBuffers(gl);
				gl.material.setTempColors(specs.bonds_materialAmbientColor_3D, null, specs.bonds_materialSpecularColor_3D, specs.bonds_materialShininess_3D);
			}
			for ( var i = 0, ii = this.bonds.length; i < ii; i++) {
				this.bonds[i].render(gl, specs);
			}
			if (this.atoms.length > 0) {
				gl.sphereBuffer.bindBuffers(gl);
				gl.material.setTempColors(specs.atoms_materialAmbientColor_3D, null, specs.atoms_materialSpecularColor_3D, specs.atoms_materialShininess_3D);
			}
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				this.atoms[i].render(gl, specs);
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
		this.getMaxDimension = function() {
			var minX = minY = Infinity;
			var maxX = maxY = -Infinity;
			for ( var i = 0, ii = this.atoms.length; i < ii; i++) {
				minX = Math.min(this.atoms[i].x, minX);
				minY = Math.min(this.atoms[i].y, minY);
				maxX = Math.max(this.atoms[i].x, maxX);
				maxY = Math.max(this.atoms[i].y, maxY);
			}
			return Math.max(maxX - minX, maxY - minY);
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

		this.vertexPositionAttribute = gl.getAttribLocation(gl.program, 'a_vertex_position');
		gl.enableVertexAttribArray(this.vertexPositionAttribute);
		this.vertexNormalAttribute = gl.getAttribLocation(gl.program, 'a_vertex_normal');
		gl.enableVertexAttribArray(this.vertexNormalAttribute);
	};

	iview.VisualSpecifications = function() {

		this.backgroundColor = '#FFFFFF';
		this.atoms_font_size_2D = 12;
		this.atoms_font_families_2D = [ 'Helvetica', 'Arial', 'Dialog' ];
		this.atoms_font_bold_2D = false;
		this.atoms_font_italic_2D = false;
		this.atoms_resolution_3D = 60;
		this.atoms_sphereRadius_3D = .4;
		this.atoms_materialAmbientColor_3D = '#000000';
		this.atoms_materialSpecularColor_3D = '#555555';
		this.atoms_materialShininess_3D = 32;
		this.bonds_resolution_3D = 60;
		this.bonds_cylinderRadius_3D = .4;
		this.bonds_materialAmbientColor_3D = '#000000';
		this.bonds_materialSpecularColor_3D = '#555555';
		this.bonds_materialShininess_3D = 32;

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
	iview.Canvas.prototype.parseReceptor = function(content) {
		var molecule = new iview.Molecule();
		var residue = 'XXXX';
		var residues = [];
		var lines = content.split('\n');
		for ( var i = 0, ii = lines.length; i < ii; i++) {
			var line = lines[i];
			if (iview.stringStartsWith(line, 'ATOM') || iview.stringStartsWith(line, 'HETATM')) {
				var atom = new iview.Atom($.trim(line.substring(76, 78)), parseFloat(line.substring(30, 38)), parseFloat(line.substring(38, 46)), parseFloat(line.substring(46, 54)));
				atom.resSeq = parseInt(line.substring(22, 26));
				atom.resName = $.trim(line.substring(17, 20));
				molecule.atoms.push(atom);
			} else if (iview.stringStartsWith(line, 'TER')) {
				residue = 'XXXX';
			}
		}
		for ( var i = 0, ii = molecule.atoms.length; i < ii; i++) {
			for ( var j = i + 1; j < ii; j++) {
				var first = molecule.atoms[i];
				var second = molecule.atoms[j];
				if (first.distance3D(second) < iview.ELEMENT[first.label].covalentRadius + iview.ELEMENT[second.label].covalentRadius) {
					molecule.bonds.push(new iview.Bond(first, second));
				}
			}
		}
		return molecule;
	};
	iview.Canvas.prototype.loadMolecule = function(molecule) {
		this.molecule = molecule;
		var p = this.molecule.getCenter3D();
		for ( var i = 0, ii = this.molecule.atoms.length; i < ii; i++) {
			this.molecule.atoms[i].sub3D(p);
		}
		this.maxDimension = this.molecule.getMaxDimension();
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
		e.p = [ e.pageX - e.offset.left, e.pageY - e.offset.top ];
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
		var difx = e.p[0] - this.lastPoint[0];
		var dify = e.p[1] - this.lastPoint[1];
		if (iview.monitor.ALT) {
			mat4.translate(this.translationMatrix, [ difx / 20, -dify / 20, 0 ]);
			this.lastPoint = e.p;
			this.repaint();
		} else {
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
