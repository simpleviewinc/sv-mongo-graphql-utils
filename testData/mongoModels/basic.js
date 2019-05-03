module.exports = function() {
	return {
		label: 'basic',
		pluralLabel: 'basics',
		schema: {
			bsonType: 'object',
			required: ['basic'],
			additionalProperties: false,
			properties: {
				_id: {
					bsonType: 'objectId',
					description: 'Mongoid for the basic.'
				},
				basic: {
					bsonType: 'string',
					description: 'a basic string'
				},
			}
		},
		indexes: [
			{
				keys: {
					_id: 1,
					test: 1
				}
			},
		]
	};
};
