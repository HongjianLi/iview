$(function() {
//	if (canvas.getContext('experimental-webgl'));

	var c = new iview('iview');
	$.get('receptor.pdbqt', function(receptor) {
		c.setBox([49.712, -28.923, 36.824], [18, 18, 20]);
		c.parseReceptor(receptor);
		$.get('ligand.pdbqt', function(ligand) {
			c.parseLigand(ligand);
			c.repaint();
			c.png();
		});
	});
});
