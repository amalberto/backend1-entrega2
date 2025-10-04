const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  id: { type: Number, unique: true, index: true }, // autoincremento
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] }
}, { versionKey: false });

const ProductModel = model('Product', productSchema);

module.exports = { ProductModel };