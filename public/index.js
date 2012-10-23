$(function() {
//	var canvas = document.getElementById('iview');
//	if (canvas.getContext('webgl')));
//	if (canvas.getContext('experimental-webgl'));
//	window.open(canvas.toDataURL('image/png'));

	$.get('2ZD1.pdb', function(complex) {
		var c = new ChemDoodle.Canvas('iview');
		c.loadMolecule(ChemDoodle.readPDB(complex, 1));
	});
});
