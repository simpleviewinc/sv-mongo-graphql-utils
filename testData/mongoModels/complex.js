module.exports = function() {
	return {
		label: 'complex',
		pluralLabel: 'complexs?',
		schema: {
			bsonType: 'object',
			required: ['test_string', 'test_date', 'test_boolean'],
			additionalProperties: false,
			properties: {
				_id: {
					bsonType: 'objectId',
					description: 'Mongoid for the asset.'
				},
				test_string: {
					bsonType: 'string'
				},
				test_date: {
					bsonType: 'date'
				},
				test_boolean: {
					bsonType: 'bool'
				},
				test_object: {
					bsonType: 'object',
					required: ['subkey_foo', 'subkey_bar'],
					additionalProperties: false,
					properties: {
						subkey_foo: {
							bsonType: 'int'
						},
						subkey_bar: {
							bsonType: 'string'
						}
					}
				},
				test_number: {
					bsonType: 'number'
				},
				test_int: {
					bsonType: 'int'
				},
			}
		},
		indexes: [
			{
				keys: {
					_id: 1,
				}
			},
		]
	};
};
