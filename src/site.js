require('./common');
require('../src/assets/images/radar/radar_legend.png');

const CSVBuilder = require('./util/factory');

var builder = CSVBuilder('http://127.0.0.1:8081/assets/list.csv');
builder.init().build();