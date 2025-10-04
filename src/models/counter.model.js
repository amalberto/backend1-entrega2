const { Schema, model } = require('mongoose');

const counterSchema = new Schema({
  _id: { type: String, required: true }, // e.j. 'products', 'carts'
  seq: { type: Number, default: 0 }
}, { versionKey: false });

const Counter = model('Counter', counterSchema);

async function getNextSequence(name) {
  const ret = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();
  return ret.seq;
}

module.exports = { Counter, getNextSequence };