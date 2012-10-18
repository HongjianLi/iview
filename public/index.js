$(function() {
	$.get('2ZD1.pdb', function(receptor) {
	$.get('T27.pdb', function(ligand) {
		var tc3d = new ChemDoodle.TransformCanvas3D('TransformCanvas3D');
		tc3d.specs.set3DRepresentation('Stick');
		tc3d.loadMolecule(ChemDoodle.readPDB(receptor + ligand, 1));
	});
	});
});
