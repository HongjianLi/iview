$(function() {
	$.get('2ZD1.pdb', function(complex) {
		var c = new ChemDoodle.Canvas('iview');
		c.specs.set3DRepresentation('Stick');
		c.loadMolecule(ChemDoodle.readPDB(complex, 1));
//		window.open(document.getElementById('TransformCanvas3D').toDataURL('image/png'));
	});
});
