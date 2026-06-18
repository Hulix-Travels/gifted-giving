const MAX_LIMIT = 100;

function parsePagination(query, { defaultLimit = 10, maxLimit = MAX_LIMIT } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { parsePagination, MAX_LIMIT };
