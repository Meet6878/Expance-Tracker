// exports.processInBatches = async (model, size, handler) => {
//   let skip = 0;

//   while (true) {
//     const docs = await model.find().skip(skip).limit(size);
//     if (!docs.length) break;

//     await Promise.all(docs.map(handler));
//     skip += size;
//   }
// };

exports.processInBatches = async (model, size, handler) => {
  let skip = 0;

  // Continue processing batches until no more records are found
  while (true) {
    // Fetch a batch of documents from the model
    const docs = await model.find().skip(skip).limit(size);

    // If no more documents are found, break the loop
    if (docs.length === 0) {
      break;
    }

    // Process the current batch of documents
    for (let doc of docs) {
      await handler(doc);  // Apply the handler to each user
    }

    // Move to the next batch by increasing the skip value
    skip += size;
  }
};
