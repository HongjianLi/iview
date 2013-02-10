$(function() {
	var iv = new iview('iview');
	$.get('3krv.pdb', function (src) {
		iv.loadReceptor(src);
	});

	[ 'camera', 'background', 'colorBy', 'secondaryStructure', 'primaryStructure', 'ligands', 'waters', 'ions' ].forEach(function(opt) {
		$('#' + opt).click(function(e){
			var options = {};
			options[opt] = e.target.innerText;
			iv.rebuildScene(options);
			iv.show();
		})
	});

	[ 'export', 'resetView' ].forEach(function(func) {
		$('#' + func).click(function(e){
			e.preventDefault();
			iv[func]();
		})
	});

	function loadFile() {
		var file = $('#file').get(0);
		if (file) file = file.files;
		if (!file || !window.FileReader || !file[0]) {
			alert("No file is selected. Or File API is not supported in your browser. Please try Firefox or Chrome.");
			return;
		}
		var reader = new FileReader();
		reader.onload = function () {
			iv.loadMolecule(reader.result);
		};
		reader.readAsText(file[0]);
	}
});
