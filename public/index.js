$(function() {
	$.get('2ZD1.pdb', function(complex) {
		var tc3d = new ChemDoodle.Canvas3D('TransformCanvas3D');
		tc3d.specs.set3DRepresentation('Stick');
		tc3d.loadMolecule(ChemDoodle.readPDB(complex, 1));
//		window.open(document.getElementById('TransformCanvas3D').toDataURL('image/png'));
	});
});
