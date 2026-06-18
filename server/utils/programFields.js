const PROGRAM_WRITABLE_FIELDS = [
  'name',
  'description',
  'longDescription',
  'category',
  'image',
  'gallery',
  'targetAmount',
  'currency',
  'impactMetrics',
  'targetMetrics',
  'impactPerDollar',
  'location',
  'duration',
  'status',
  'priority',
  'tags',
  'featured',
  'donationOptions',
  'updates',
  'testimonials'
];

const PROGRAM_SORT_FIELDS = ['createdAt', 'name', 'targetAmount', 'currentAmount'];

function pickProgramFields(body, allowedFields = PROGRAM_WRITABLE_FIELDS) {
  const result = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      result[key] = body[key];
    }
  }
  return result;
}

function generateProgramSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = {
  PROGRAM_WRITABLE_FIELDS,
  PROGRAM_SORT_FIELDS,
  pickProgramFields,
  generateProgramSlug
};
