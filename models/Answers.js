var GeoJSON = require('mongoose-geojson-schema');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Define survey response model schema
const AnswersSchema = new mongoose.Schema({
    phone: String,
    responses: [mongoose.Schema.Types.Mixed],
    spanish: {
        type: Boolean,
        default: false
    },
    participant: {
        type: Boolean,
        default: false
    },
    complete: {
        type: Boolean,
        default: false
    },
    home: {
        type: mongoose.Schema.Types.GeoJSON
    },
    work: {
        type: mongoose.Schema.Types.GeoJSON
    },
    school: {
        type: mongoose.Schema.Types.GeoJSON
    },
    flag: {
        type: Boolean
    }
}, {
        usePushEach: true
    });

var Answers = mongoose.model('Answers', AnswersSchema);
module.exports = Answers;
