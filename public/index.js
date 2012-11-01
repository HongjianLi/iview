$(function() {
//	var canvas = document.getElementById('iview');
//	if (canvas.getContext('webgl')));
//	if (canvas.getContext('experimental-webgl'));
//	window.open(canvas.toDataURL('image/png'));

	var c = new iview('iview');
	$.get('receptor.pdbqt', function(receptor) {
		c.setBox([49.712, -28.923, 36.824], [18, 18, 20]);
		c.parseReceptor(receptor);
		$.get('ligand2.pdbqt', function(ligand) {
			c.parseLigand(ligand);
			c.repaint();
		});
	});
});
