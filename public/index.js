$(function() {
//	if (canvas.getContext('experimental-webgl'));

	var iv = new iview({
		id: 'iview',
		ligandmove: function(hbonds) {
			$('#hbonds').html(hbonds.length);
		}
	});
	$.get('receptor.pdbqt', function(receptor) {
		iv.setBox([49.712, -28.923, 36.824], [18, 18, 20]);
		iv.parseReceptor(receptor);
		$.get('ligand.pdbqt', function(ligand) {
			iv.parseLigand(ligand);
			iv.repaint();
		});
	});
//	iv.png();
});
