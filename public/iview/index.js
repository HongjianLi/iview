$(function () {
	var iv = new iview('iview');
	$.get('2ZD1_protein.pdb', function (p) {
	$.get('2ZD1_ligand.pdb', function (l) {
		iv.loadProtein(p);
		iv.loadLigand(l);
		iv.rebuildScene();
		iv.resetView();
	});
	});

	['camera', 'background', 'colorBy', 'primaryStructure', 'secondaryStructure', 'surface', 'opacity', 'wireframe', 'ligand', 'solvents', 'effect'].forEach(function (opt) {
		$('#' + opt).click(function (e) {
			var options = {};
			options[opt] = e.target.innerText;
			iv.rebuildScene(options);
			iv.render();
		})
	});

	['resetView', 'exportView'].forEach(function (func) {
		$('#' + func).click(function (e) {
			e.preventDefault();
			iv[func]();
		})
	});

	$('').click(function (e) {
		var file = $('#file').get(0);
		if (!window.FileReader || !file || !file.files || !file.files[0]) {
			alert("No file is selected. Or File API is not supported in your browser. Please try Firefox or Chrome.");
			return;
		}
		var reader = new FileReader();
		reader.onload = function () {
			iv.loadMolecule(reader.result);
		};
		reader.readAsText(file.files[0]);
	});

	var rf = new Worker('rf.js');
	rf.onmessage = function (ev) {
		if (ev.data === undefined) {
			rf.postMessage(JSON.stringify({
				x: [2097,673,710,17,125,39,39,0,499,167,164,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,585,174,183,6]
			}));
		} else {
			console.log(ev.data);
		}
	};
	$.get('trainx.csv', function (trainxcsv) {
	$.get('trainy.csv', function (trainycsv) {
		rf.postMessage(JSON.stringify({
			x: trainxcsv.split('\n').map(function (line) {
				return line.split(',').map(function (token) {
					return parseFloat(token);
				});
			}),
			y: trainycsv.split('\n').map(function (line) {
				return parseFloat(line);
			}),
		}));
	});
	});
});
