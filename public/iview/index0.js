$(function() {
	var chart = new AmCharts.AmSerialChart(), data = [];
	chart.dataProvider = data;
	chart.pathToImages = "./";
	chart.marginTop = 30;
	chart.categoryField = "conf";
	chart.addListener('dataUpdated', function() {
		var r = ((data.length - 1) >> 5) << 5;
		chart.zoomToIndexes(r, r + 31);
	});
	var categoryAxis = chart.categoryAxis;
	categoryAxis.title = "Conformation";
	categoryAxis.autoGridCount = false;
	categoryAxis.gridCount = 32;
	categoryAxis.gridPosition = 'start';
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.title = "Free energy, inter+intra (kcal/mol)";
	valueAxis.minimum = -20;
	valueAxis.maximum = 0;
	chart.addValueAxis(valueAxis);
	var graph = new AmCharts.AmGraph();
	graph.type = "smoothedLine";
	graph.valueField = "eTotal";
	graph.bullet = "round";
	graph.bulletBorderColor = "#FFFFFF";
	graph.bulletBorderThickness = 2;
	graph.lineThickness = 4;
	chart.addGraph(graph);
	var guide = new AmCharts.Guide();
	guide.value = -20;
	guide.toValue = -15;
	guide.fillColor = "#CC0000";
	guide.fillAlpha = 0.4;
	valueAxis.addGuide(guide);
	var guide = new AmCharts.Guide();
	guide.value = -15;
	guide.toValue = -10;
	guide.fillColor = "#CC0000";
	guide.fillAlpha = 0.3;
	valueAxis.addGuide(guide);
	var guide = new AmCharts.Guide();
	guide.value = -10;
	guide.toValue = -5;
	guide.fillColor = "#CC0000";
	guide.fillAlpha = 0.2;
	valueAxis.addGuide(guide);
	var guide = new AmCharts.Guide();
	guide.value = -5;
	guide.toValue = 0;
	guide.fillColor = "#CC0000";
	guide.fillAlpha = 0.1;
	valueAxis.addGuide(guide);
	chart.write("chart");
	var iv = new iview({
		id: 'iview',
		refresh: function() {
			$('#conformation').html(iv.save());
			$('#nhbonds').html(iv.hbonds.length);
			var hblis = [];
			for (var i = 0, ii = iv.hbonds.length; i < ii; ++i) {
				var hb = iv.hbonds[i];
				hblis.push('<li>' + hb.a1.id + ' - ' + hb.a2.id + '</li>');
			}
			$('#hbonds').html(hblis.join(''));
			$('#eNormalized').html(iv.ligand.eNormalized.toFixed(3));
			$('#eTotal').html(iv.ligand.eTotal.toFixed(3));
			$('#eInter').html(iv.ligand.eInter.toFixed(3));
			$('#eIntra').html(iv.ligand.eIntra.toFixed(3));
			$('#efficiency').html(iv.ligand.efficiency.toFixed(3));
			data.push({
				conf: data.length + 1,
				eTotal: iv.ligand.eTotal
			});
			chart.validateData();
		}
	});
	if (iv.disabled) {
		$('#demo').html('Your browser does not support HTML5 canvas.');
		return;
	}
	$.get('receptor0.pdbqt', function(receptor) {
		iv.setBox([49.712, -28.923, 36.824], [18, 18, 20]);
		iv.parseReceptor(receptor);
		$.get('ligand0.pdbqt', function(ligand) {
			iv.parseLigand(ligand);
			$('#atoms').html(iv.ligand.atoms.length);
			$('#hatoms').html(iv.ligand.nHeavyAtoms);
			$('#mwt').html(iv.ligand.mwt);
			$('#nrb').html(iv.ligand.frames.length - 1);
			$('#hbds').html(iv.ligand.hbds.length);
			$('#hbas').html(iv.ligand.hbas.length);
			$('#flexPenalty').html(iv.ligand.flexPenalty.toFixed(3));
			iv.repaint();
			$('#export').click(function(e) {
				e.preventDefault();
				iv.export();
			});
			$('#dock').click(function(e) {
				e.preventDefault();
				iv.dock();
			});
		});
	});
});
