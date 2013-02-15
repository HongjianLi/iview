$(function () {
	var iv = new iview('iview');
	$.get('2DHB.pdb', function (src) {
		iv.loadReceptor(src);
	});

	['camera', 'background', 'colorBy', 'primaryStructure', 'secondaryStructure', 'surface', 'opacity', 'wireframe', 'ligands', 'waters', 'ions', 'effect'].forEach(function (opt) {
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
});
