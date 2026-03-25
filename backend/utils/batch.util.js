exports.processInBatches = async (model, size, handler) => {
  let skip = 0;

  while (true) {
    const docs = await model.find().skip(skip).limit(size);
    if (!docs.length) break;

    await Promise.all(docs.map(handler));
    skip += size;
  }
};