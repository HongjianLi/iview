var express = require('express');
express().use(express.static(__dirname + '/public')).listen(3000);
