const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const Gift = new Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    description: { type: String},
    image: { type: String },
    author: { type: String },
    idAuthor: { type: String, required: true},
    slug: { type: String, slug: 'name', unique: true },
}, {
    _id: false,
    timestamps: true,
});

mongoose.plugin(slug);

Gift.plugin(AutoIncrement);
Gift.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Gift', Gift);