import * as moment from "moment";


console.log(moment.duration(moment().diff(moment('2015-12-22 00:00:00'))).asSeconds());