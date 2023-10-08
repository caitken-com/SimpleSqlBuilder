/**
 * @description Builds SQL query
 * @package @caitken-com/simple-sql-builder
 * @author Christopher Aitken
 * @version 1.0.0
 */
class SimpleSqlBuilder
{
	sql_select;
	sql_insert;
	sql_update;
	sql_delete;
	sql_where;
	sql_joins;
	sql_having;
	sql_group;
	sql_order;
	sql_limit;
	sql_mode;
	sql_params;
	sql_identifiers;
	sql_param_counter;


	/**
	 * @description Resets values
	 * @public
	 * @return {SimpleSqlBuilder}
	 */
	constructor()
	{
		this.sql_select = [];
		this.sql_insert = [];
		this.sql_update = [];
		this.sql_delete = [];
		this.sql_where = [];
		this.sql_joins = [];
		this.sql_having = [];
		this.sql_group = [];
		this.sql_order = [];
		this.sql_limit = null;
		this.sql_mode = null;
		this.sql_params = [];
		this.sql_identifiers = [];
		this.sql_param_counter = 0;
	}


	/**
	 * @description Prepares SQL `SELECT` statement
	 * @public
	 * @param {Object} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	select(payload)
	{
		if (!('table' in payload)) throw Error('Select: Missing table');
		if (!('columns' in payload)) throw Error('Select: Missing columns');

		this.sql_mode = 'select';
		this.sql_select = {
			'table': this.table(payload.table),
			'columns': payload.columns,
		};

		return this;
	}


	/**
	 * @description Prepares SQL `INSERT` statement
	 * @public
	 * @param {Object} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	insert(payload)
	{
		if (!('table' in payload)) throw Error('Insert: Missing table');
		if (!('columns' in payload)) throw Error('Insert: Missing columns');
		if (!('duplicates' in payload)) payload.duplicates = [];

		this.sql_mode = 'insert';
		this.sql_insert = {
			'table': this.table(payload.table),
			'columns': payload.columns,
			'duplicates': payload.duplicates,
		};

		return this;
	}


	/**
	 * @description Prepares SQL `DELETE` statement
	 * @public
	 * @param {Object} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	delete(payload)
	{
		if (!('table' in payload)) throw Error('Delete: Missing table');

		this.sql_mode = 'delete';
		this.sql_delete = {
			'table': this.table(payload.table),
		};

		return this;
	}


	/**
	 * @description Prepares SQL `UPDATE` statement
	 * @public
	 * @param {Object} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	update(payload)
	{
		if (!('table' in payload)) throw Error('Update: Missing table');
		if (!('columns' in payload)) throw Error('Update: Missing columns');

		this.sql_mode = 'update';
		this.sql_update = {
			'table': this.table(payload.table),
			'columns': payload.columns,
		};

		return this;
	}


	/**
	 * @description Prepares SQl `JOIN` statement
	 * @public
	 * @param {Object} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	joins(payload)
	{
		for (let i in payload)
		{
			if (!('type' in payload[i])) throw Error('Joins: Missing type');
			if (!('table' in payload[i])) throw Error('Joins: Missing table');
			if (!('conditions' in payload[i])) throw Error('Joins: Missing conditions');

			this.sql_joins.push({
				'type': payload[i].type,
				'table': this.table(payload[i].table),
				'conditions': payload[i].conditions,
			});
		}

		return this;
	}


	/**
	 * @description Prepares SQl `ORDER` statement
	 * @public
	 * @param {array} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	order(payload)
	{
		for (let i in payload)
		{
			this.sql_order.push(payload[i]);
		}

		return this;
	}


	/**
	 * @description Prepares SQl `GROUP` statement
	 * @public
	 * @param {array} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	group(payload)
	{
		for (let i in payload)
		{
			this.sql_group.push(payload[i]);
		}

		return this;
	}


	/**
	 * @description Prepares SQl `WHERE` statement
	 * @public
	 * @param {array} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	where(payload)
	{
		for (let i in payload)
		{
			this.sql_where.push(payload[i]);
		}

		return this;
	}


	/**
	 * @description Prepares SQl `HAVING` statement
	 * @public
	 * @param {array} payload
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	having(payload)
	{
		for (let i in payload)
		{
			this.sql_having.push(payload[i]);
		}

		return this;
	}


	/**
	 * @description Prepares sql limit statement
	 * @public
	 * @param {number|string|object} val
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	limit(val)
	{
		let limit = 0;
		let offset = 0;

		switch (typeof val)
		{
			case 'number':
			case 'string':
				limit = parseInt(val);
				break;

			case 'object':
				if (0 in val) offset = parseInt(val[0]);
				if (1 in val) limit = parseInt(val[1]);
				break;
		}

		if (isNaN(limit)) limit = 0;
		if (isNaN(offset)) offset = 0;

		if (offset > 0)
		{
			this.sql_limit = `LIMIT ${offset}, ${limit}\n`;
		}
		else if (limit > 0)
		{
			this.sql_limit = `LIMIT ${limit}\n`;
		}

		return this;
	}


	/**
	 * @description Prepares sql params
	 * @public
	 * @param {object} params
	 * @return {SimpleSqlBuilder} this, chainable
	 */
	params(params)
	{
		for (let i in params)
		{
			this.sql_params[i] = params[i];
		}

		return this;
	}



	/**
	 * @description Generate complete SQL query
	 * @public
	 * @return {string} The query
	 */
	build()
	{
		let query = '';

		switch (this.sql_mode)
		{
			case 'select':
				query += this.buildSelect();

				for (let i in this.sql_joins)
				{
					query += this.buildJoin(this.sql_joins[i]);
				}
				break;

			case 'insert':
				query += this.buildInsert();

				for (let i in this.sql_joins)
				{
					query += this.buildJoin(this.sql_joins[i]);
				}
				break;

			case 'delete':
				query += this.buildDelete();

				for (let i in this.sql_joins)
				{
					query += this.buildJoin(this.sql_joins[i]);
				}
				break;

			case 'update':
				let joins = '';

				for (let i in this.sql_joins)
				{
					joins += this.buildJoin(this.sql_joins[i]);
				}

				query += this.buildUpdate(joins);
				break;

			default:
				throw Error('Unknown query type');
		}

		if (this.sql_where.length > 0) query += this.buildWhere();
		if (this.sql_having.length > 0) query += this.buildHaving();
		if (this.sql_group.length > 0) query += this.buildGroup();
		if (this.sql_order.length > 0) query += this.buildOrder();
		if (this.sql_limit != null) query += this.sql_limit;

		return query;
	}


	/**
	 * @description Build `SELECT` string
	 * @private
	 * @returns {string}
	 */
	buildSelect()
	{
		let table = null;
		let alias = null;
		let columns = this.processColumns(this.sql_select.columns);
		let query = '';

		if (typeof this.sql_select.table == 'object')
		{
			for (let i in this.sql_select.table)
			{
				table = i;
				alias = this.sql_select.table[i];
			}
		}
		else
		{
			table = this.sql_select.table;
		}

		query += `SELECT ${columns.join(`,\n`)}\n`;
		query += `FROM ${table}${alias ? ` AS ${alias}` : ''}\n`;

		return query;
	}


	/**
	 * @description Build `INSERT` string
	 * @private
	 * @returns {string}
	 */
	buildInsert()
	{
		let columns = this.processValues(this.sql_insert.columns);
		let cols = [];
		let vals = [];
		let query = '';

		for (let i in columns)
		{
			cols.push(i);
			vals.push(columns[i]);
		}

		query += `INSERT INTO ${this.sql_insert.table} (${cols.join(`, `)})\n`;
		query += `VALUES (${vals.join(', ')})\n`;

		if (this.sql_insert.duplicates.length)
		{
			query += `ON DUPLICATE KEY UPDATE ${this.sql_insert.duplicates.join(`,\n`)}\n`;
		}

		return query;
	}


	/**
	 * @description Build `UPDATE` string
	 * @private
	 * @param {string} joins
	 * @returns {string}
	 */
	buildUpdate(joins)
	{
		let table = null;
		let alias = null;
		let columns = this.processValues(this.sql_update.columns);
		let query = '';

		if (typeof this.sql_update.table == 'object')
		{
			for (let i in this.sql_update.table)
			{
				table = i;
				alias = this.sql_update.table[i];
			}
		}
		else
		{
			table = this.sql_update.table;
		}

		query += `UPDATE ${table}${alias ? ` AS ${alias}` : ''}\n`;

		let strings = [];
		for (let i in columns)
		{
			strings.push(`${i} = ${columns[i]}`);
		}

		query += `${joins}SET ${strings.join(`,\n`)}\n`;

		return query;
	}


	/**
	 * @description Build `DELETE` string
	 * @private
	 * @returns {string}
	 */
	buildDelete()
	{
		let table = null;
		let alias = null;
		let query = '';

		if (typeof this.sql_delete.table == 'object')
		{
			for (let i in this.sql_delete.table)
			{
				table = i;
				alias = this.sql_delete.table[i];
			}
		}
		else
		{
			table = this.sql_delete.table;
		}

		query += `DELETE ${(alias) ? alias : ''}\n`;
		query += `FROM ${table}${(alias) ? ` AS ${alias}` : ''}\n`;

		return query;
	}


	/**
	 * @description Build `JOIN` string
	 * @private
	 * @param {string} join
	 * @returns {string}
	 */
	buildJoin(join)
	{
		let table = null;
		let alias = null;
		let conditions = this.processConditions(join.conditions);
		let query = '';

		if (typeof join.table == 'object')
		{
			for (let i in join.table)
			{
				table = i;
				alias = join.table[i];
			}
		}
		else
		{
			table = join.table;
		}

		query += `${String(join.type).toUpperCase()} JOIN ${table}${(alias) ? ` AS ${alias}` : ''}\n`;
		query += `ON ${conditions.join(`\nAND `)}\n`;

		return query;
	}


	/**
	 * @description Build `WHERE` string
	 * @private
	 * @returns {string}
	 */
	buildWhere()
	{
		let conditions = this.processConditions(this.sql_where);

		return `WHERE ${conditions.join(`\nAND `)}\n`;
	}


	/**
	 * @description Build `HAVING` string
	 * @private
	 * @returns {string}
	 */
	buildHaving()
	{
		let conditions = this.processConditions(this.sql_having);

		return `HAVING ${conditions.join(`\nAND `)}\n`;
	}


	/**node
	 * @description Build `GROUP BY` string
	 * @private
	 * @returns {string}
	 */
	buildGroup()
	{
		let columns = this.processColumns(this.sql_group);

		return `GROUP BY ${columns.join(`,\n`)}\n`;
	}


	/**
	 * @description Build `ORDER BY` string
	 * @private
	 * @returns {string}
	 */
	buildOrder()
	{
		let columns = this.processColumns(this.sql_order);

		return `ORDER BY ${columns.join(`,\n`)}\n`;
	}


	/**
	 * @description Prepares SQl clause statement
	 * @private
	 * @param {array} conditions
	 *		[column, operator, value] rows
	 *		{or: []} rows
	 *		'function()' rows
	 * @return {string[]}
	 */
	processConditions(conditions)
	{
		let list = [];

		for (let i in conditions)
		{
			// [Column, Operator, Value]
			if (Array.isArray(conditions[i]) && conditions[i].length == 3)
			{
				list.push(this.processCondition(conditions[i]));
			}
			// {OR: []}
			else if (typeof conditions[i] === 'object' && conditions[i] !== null)
			{
				let conds = [];
				let combine = 'AND';

				// Uppercase key
				if ('and' in conditions[i])
				{
					conditions[i]['AND'] = [...conditions[i]['and']];
					delete conditions[i]['and'];
				}
				else if ('or' in conditions[i])
				{
					conditions[i]['OR'] = [...conditions[i]['or']];
					delete conditions[i]['or'];
				}

				if ('OR' in conditions[i]) combine = 'OR';

				conds = this.processConditions(conditions[i][combine]);

				combine = ` ${combine} `;
				list.push(`(${conds.join(combine)})`);
			}
			// 'FUNCTION()'
			else if (typeof conditions[i] === 'string' || conditions[i] instanceof String)
			{
				list.push(conditions[i])
			}
		}

		return list;
	}


	/**
	 * @description Create SQL clauses
	 * @private
	 * @param {array} condition [column, operator, value]
	 * @return {string}
	 */
	processCondition(condition)
	{
		if (condition.length != 3) return null;
		let vals = [];

		switch (condition[1])
		{
			case '=':
				return `${this.identifierOrQuote(condition[0])} = ${this.identifierOrQuote(condition[2])}`;

			case '<=':
				return `${this.identifierOrQuote(condition[0])} <= ${this.identifierOrQuote(condition[2])}`;

			case '>=':
				return `${this.identifierOrQuote(condition[0])} >= ${this.identifierOrQuote(condition[2])}`;

			case '<':
				return `${this.identifierOrQuote(condition[0])} < ${this.identifierOrQuote(condition[2])}`;

			case '>':
				return `${this.identifierOrQuote(condition[0])} > ${this.identifierOrQuote(condition[2])}`;

			case '!=':
				return `${this.identifierOrQuote(condition[0])} != ${this.identifierOrQuote(condition[2])}`;

			case '<>':
				return `${this.identifierOrQuote(condition[0])} != ${this.identifierOrQuote(condition[2])}`;

			case 'is':
				return `${this.identifierOrQuote(condition[0])} IS ${this.identifierOrQuote(condition[2])}`;

			case 'is not':
				return `${this.identifierOrQuote(condition[0])} IS NOT ${this.identifierOrQuote(condition[2])}`;

			case 'between':
				if (typeof condition[2] != 'object') return null;

				for (let val in condition[2])
				{
					vals.push(this.identifierOrQuote(val));
				}

				return `${this.identifierOrQuote(condition[0])} BETWEEN ${vals.join(" AND ")}`;

			case 'in':
				if (typeof condition[2] != 'object') return null;

				for (let i in condition[2])
				{
					vals.push(this.identifierOrQuote(condition[2][i], true));
				}

				return `${this.identifierOrQuote(condition[0])} IN (${vals.join(',')})`;

			case 'not in':
				if (typeof condition[2] != 'object') return null;

				for (let i in condition[2])
				{
					vals.push(this.identifierOrQuote(condition[2][i], true));
				}

				return `${this.identifierOrQuote(condition[0])} NOT IN (${vals.join(',')})`;

			case 'contains':
				return `${this.identifierOrQuote(condition[0])} LIKE '%${this.sqlEscape(condition[2])}%'`;

			case 'begins':
				return `${this.identifierOrQuote(condition[0])} LIKE '${this.sqlEscape(condition[2])}%'`;

			case 'ends':
				return `${this.identifierOrQuote(condition[0])} LIKE '%${this.sqlEscape(condition[2])}'`;

			case 'in set':
				return `FIND_IN_SET(${this.identifierOrQuote(condition[0])}, ${this.quote(condition[2])})`;

			default:
				throw Error('Condition: Unknown clause');
		}
	}


	/**
	 * @description Prepares SQL `select|group|order` columns
	 * @private
	 * @param {string[]} columns
	 * @return {string[]}
	 */
	processColumns(columns)
	{
		let list = [];

		for (let i in columns)
		{
			if (typeof columns[i] == 'object')
			{
				for (let j in columns[i])
				{
					if (!Array('ASC','DESC').includes(String(columns[i][j]).toUpperCase())) continue;

					list.push(`${this.identifier(j, true)} ${String(columns[i][j]).toUpperCase()}`);
				}
			}
			else
			{
				list.push(this.identifierOrQuote(columns[i], true));
			}
		}

		return list;
	}


	/**
	 * @description Prepares SQL `insert|update` columns
	 * @private
	 * @param {string[]} columns
	 * @return {string[]}
	 */
	processValues(columns)
	{
		if (typeof columns !== 'object') return;
		let list = [];

		for (let i in columns)
		{
			list[this.identifier(i, true)] = this.identifierOrQuote(columns[i]);
		}

		return list;
	}


	/**
	 * @description Prepares SQL table names
	 * @private
	 * @param {Object|String} payload {'table': 'alias'} | 'table'
	 * @return {Object}
	 */
	table(payload)
	{
		if (typeof payload !== 'object')
		{
			this.sql_identifiers.push(payload);
			return this.identifier(payload, true);
		}

		let obj = {};
		for (let i in payload)
		{
			this.sql_identifiers.push(i);
			this.sql_identifiers.push(payload[i]);

			obj[this.identifier(i, true)] = this.identifier(payload[i], true);

			return obj;
		}
	}


	/**
	 * @description Attempts to make given value sql-injection safe
	 * @public
	 * @param {string} val
	 * @return {string} Escaped value
	 */
	sqlEscape(val)
	{
		// eslint-disable-line no-control-regex
		let reg = /[\0\b\t\n\r\x1a\"\'\\]/g;

		let map = {
			'\0'	: '\\0',
			'\b'	: '\\b',
			'\t'	: '\\t',
			'\n'	: '\\n',
			'\r'	: '\\r',
			'\x1a'	: '\\Z',
			'"'		: '\\"',
			'\''	: '\\\'',
			'\\'	: '\\\\'
		};

		let chunk = reg.lastIndex = 0;
		let escaped = '';
		let match;

		while ((match = reg.exec(val)))
		{
			escaped += val.slice(chunk, match.index) + map[match[0]];
			chunk = reg.lastIndex;
		}

		if (chunk === 0) return val;
		if (chunk < val.length) return escaped + val.slice(chunk);
		return escaped;
	}


	/**
	 * @description Determines if value is an identifier or static string to quote
	 * @private
	 * @param {string|number} val
	 * @return {string|number}
	 */
	identifierOrQuote(val, force_quote)
	{
		force_quote = force_quote || false;

		// No need to process numbers|null|bool
		switch (typeof val)
		{
			case 'bool':
				return (val) ? 1 : 0;

			case 'number':
				return (force_quote) ? `'${val}'` : val;

			case 'object':
				if (val === null) return 'NULL';
				break;
		}

		// Numeric string params '?'
		if (val === '?' && (this.sql_param_counter in this.sql_params))
		{
			return this.quote(this.sql_params[this.sql_param_counter++], force_quote);
		}

		// Associative string params '?:key'
		let matches = String(val).match(RegExp(/\?\:([a-zA-Z_0-9]+)/, 'g'));
		if (matches != null && (String(matches[0]).replace('?:', '') in this.sql_params))
		{
			return this.quote(this.sql_params[String(matches[0]).replace('?:', '')], force_quote);
		}

		// Column `identifier`
		return this.identifier(val, force_quote);
	}


	/**
	 * @description Prepares value as SQL safe 'string'|number
	 * @private
	 * @param {number|string} val
	 * @return {number|string}
	 */
	quote(val, force_quote)
	{
		force_quote = force_quote || false;

		switch (typeof val)
		{
			case 'bool':
				return (val) ? 1 : 0;

			case 'number':
				return force_quote ? `'${val}'` : val;

			case 'object':
				if (val === null) return 'NULL';
				return '';

			case 'string':
			default:
				return `'${this.sqlEscape(val)}'`;
		}
	}


	/**
	 * @description Prepares value as SQL safe `table`.`column` identifiers
	 * @private
	 * @param {number|string} val
	 * @param {bool} force_quote Force back-ticking
	 * @return {string}
	 */
	identifier(val, force_quote)
	{
		let modified = false;
		force_quote = force_quote || false;

		// `table`.`column`
		val = String(val).replace(RegExp(/([a-zA-Z_0-9]+\.[a-zA-Z_0-9*]+)/, 'g'), (match) =>
		{
			let words = String(match).split('.');

			// Validate against list of registered tables
			if ((0 in words) && !this.sql_identifiers.includes(words[0])) return match;

			modified = true;

			for (let i in words)
			{
				if (!Array('*').includes(words[i])) words[i] = `\`${this.sqlEscape(words[i])}\``;
			}

			return words.join('.');
		});

		// 'AS `column`'
		val = String(val).replace(/(as|AS) ([a-zA-Z0-9_]+)/g, (full, as, column) =>
		{
			modified = true;
			return `AS \`${this.sqlEscape(column)}\``
		});

		// `column`
		if (!modified && force_quote && String(val).indexOf(' ') == -1) return `\`${this.sqlEscape(val)}\``;

		return val;
	}


	/**
	 * Generate SQL query string from JSON
	 * @public
	 * @param {Object} payload
	 * @return {String}
	 */
	static fromJson(payload)
	{
		let sql = new SimpleSqlBuilder();

		if ('select' in payload) sql.select(payload.select);
		if ('insert' in payload) sql.insert(payload.insert);
		if ('update' in payload) sql.update(payload.update);
		if ('delete' in payload) sql.delete(payload.delete);
		if ('joins' in payload) sql.joins(payload.joins);
		if ('where' in payload) sql.where(payload.where);
		if ('having' in payload) sql.having(payload.having);
		if ('order' in payload) sql.order(payload.order);
		if ('group' in payload) sql.group(payload.group);
		if ('limit' in payload) sql.limit(payload.limit);
		if ('params' in payload) sql.params(payload.params);

		return sql.build();
	}
}


module.exports = SimpleSqlBuilder;
