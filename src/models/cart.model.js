const { Schema, model } = require('mongoose');

const cartSchema = new Schema({
  id: { type: Number, unique: true, index: true }, // autoincremento
  products: {
    type: [{ 
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, 
      quantity: { type: Number, default: 1, min: 1 } 
    }],
    default: []
  }
}, { versionKey: false });

const CartModel = model('Cart', cartSchema);

module.exports = { CartModel };