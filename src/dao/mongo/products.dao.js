const { ProductModel } = require('../../models/product.model');
const { getNextSequence } = require('../../models/counter.model');

exports.getAll = async () => {
  try {
    return await ProductModel.find({}).lean();
  } catch (err) {
    throw new Error(`Mongo(getAll products): ${err.message}`);
  }
};

exports.getById = async (id) => {
  try {
    return await ProductModel.findOne({ id: Number(id) }).lean();
  } catch (err) {
    throw new Error(`Mongo(getById product): ${err.message}`);
  }
};

exports.create = async (product) => {
  try {
    const nextId = await getNextSequence('products');
    const doc = await ProductModel.create({ ...product, id: nextId });
    return doc.toObject();
  } catch (err) {
    if (err.code === 11000) {
      if (String(err.message).includes('code'))
        throw new Error('el código ya existe');
      if (String(err.message).includes('id'))
        throw new Error('conflicto de id');
    }
    throw new Error(`Mongo(create product): ${err.message}`);
  }
};

exports.update = async (id, updates) => {
  try {
    const doc = await ProductModel.findOneAndUpdate(
      { id: Number(id) },
      { $set: updates },
      { new: true }
    ).lean();
    return doc;
  } catch (err) {
    if (err.code === 11000 && String(err.message).includes('code')) {
      throw new Error('el código ya existe');
    }
    throw new Error(`Mongo(update product): ${err.message}`);
  }
};

exports.remove = async (id) => {
  try {
    const res = await ProductModel.deleteOne({ id: Number(id) });
    return res.deletedCount ? Number(id) : null;
  } catch (err) {
    throw new Error(`Mongo(remove product): ${err.message}`);
  }
};

exports.removeAll = async () => {
  try {
    const res = await ProductModel.deleteMany({});
    return res.deletedCount;
  } catch (err) {
    throw new Error(`Mongo(removeAll products): ${err.message}`);
  }
};

exports.paginate = async ({ page = 1, limit = 10, sort, filter = {} }) => {
  try {
    const _page  = Math.max(1, Number(page)  || 1);
    const _limit = Math.max(1, Number(limit) || 10);
    const skip   = (_page - 1) * _limit;

    const sortObj =
      sort === 'asc'  ? { price:  1 } :
      sort === 'desc' ? { price: -1 } : {};

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort(sortObj).skip(skip).limit(_limit).lean(),
      ProductModel.countDocuments(filter)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / _limit));

    return {
      payload: items,
      total, limit: _limit, page: _page,
      totalPages,
      prevPage: _page > 1 ? _page - 1 : null,
      nextPage: _page < totalPages ? _page + 1 : null,
      hasPrevPage: _page > 1,
      hasNextPage: _page < totalPages
    };
  } catch (err) {
    throw new Error(`Mongo(paginate products): ${err.message}`);
  }
};

exports.getUniqueCategories = async () => {
  try {
    const categories = await ProductModel.distinct('category');
    return categories.filter(cat => cat && cat.trim() !== '').sort();
  } catch (err) {
    throw new Error(`Mongo(getUniqueCategories): ${err.message}`);
  }
};