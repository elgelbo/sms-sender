const GeoJSON = require('mongoose-geojson-schema');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  upload: String
});

// sets slug to name in url save using npm package
storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); //skip
    return; //stop function
  }
  this.slug = slug(this.name);
  next();
  // todo need to update to make slugs unique
});

module.exports = mongoose.model('Store', storeSchema)
