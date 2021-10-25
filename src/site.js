require('./common');
require('../src/assets/images/radar/radar_legend.png');

const CSVBuilder = require('./util/factory');

var builder = CSVBuilder('http://localhost:1313/radar.json');
builder.init().build();