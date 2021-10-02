module.exports = paginate = async (
  model,
  associations,
  pageSize,
  pageLimit,
  search,
  next
) => {
  try {
    const limit = parseInt(pageLimit) || 10;
    const page = parseInt(pageSize) || 1;

    let options = {
      offset: getOffset(page, limit),
      limit: limit,
    };

    if (Object.keys(search).length) {
      options = {
        ...search,
        ...options,
      };
    }

    if (associations.length > 0) {
      options = { ...options, ...associations[0] };
    }

    let { count, rows } = await model.findAndCountAll(options);

    console.log(options);

    return {
      totalPages: getTotalPages(count, limit),
      previousPage: getPreviousPage(page),
      currentPage: page,
      nextPage: getNextPage(page, limit, count),
      total: count,
      limit: limit,
      results: rows.length,
      data: rows,
    };
  } catch (error) {
    next(error);
  }
};

const getOffset = (page, limit) => {
  return page * limit - limit;
};

const getNextPage = (page, limit, total) => {
  if (total / limit > page) {
    return page + 1;
  }

  return null;
};

const getPreviousPage = (page) => {
  if (page <= 1) {
    return null;
  }
  return page - 1;
};

const getTotalPages = (total, limit) => {
  return Math.ceil(total / limit);
};
