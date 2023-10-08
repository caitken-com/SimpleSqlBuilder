# Simple SQL Builder

Generates query strings ready for execution, with built-in parameter escaping & quoting, and helpful clause builder.

## Public methods

- select
- insert
- delete
- update
- joins
- order
- group
- where
- having
- limit
- params
- fromJson
- build


### select

Takes an *{object}* with the following keys:

| param | type | comment |
|---|---|---|
| table | *{string/object}* | `'table_name'` / `{'table_name': 'alias'}` |
| columns | *{string[]}* | List of columns to fetch |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.select({
    'table': {'users': 'user'},
    'columns': [
        'user.first_name',
        'user.last_name',
        'YEAR(user.date_added) AS alumni'
    ]
});
```


### insert

Takes an *{object}* with the following keys:

| param | type | comment |
|---|---|---|
| table | *{string}* | `'table_name'` |
| columns | *{object}* | `{column: value}` pairs |
| duplicates | *{string}* | Optional update clause on duplicate. **Caution: string not escaped** |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.insert({
    'table': 'users',
    'columns': {
        'first_name', '?',
        'last_name', '?',
        'age': '?'
    }
})
.params([
    'John',
    'Doe',
    30
]);
```


### delete

Takes an *{object}* with the following keys:

| param | type | comment |
|---|---|---|
| table | *{string/object}* | `'table_name'` / `{'table_name': 'alias'}` |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.delete({
    'table': {'users': 'user'}
})
.where([
    ['user.id','=','?'],
])
.params([
    47,
]);
```


### update

Takes an *{object}* with the following keys:

| param | type | comment |
|---|---|---|
| table | *{string/object}* | `'table_name'` / `{'table_name': 'alias'}` |
| columns | *{object}* | `{column: value}` pairs |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.update({
    'table': {'users': 'user'},
    'columns': {
        'age': '?'
    }
})
.where([
    ['user.id','=','?'],
])
.params([
    47,
    30,
]);
```


### joins

Takes an *{object[]}* with the following keys:

| param | type | comment |
|---|---|---|
| type | *{string}* | `inner` / `outer` / `left` / `right` / `cross` |
| table | *{string/object}* | `'table_name'` / `{'table_name': 'alias'}` |
| conditions | *{array}* | @see `where` for more information |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.select({
    'table': {'users': 'user'},
    'columns': ['user.*']
})
.joins([
    {
        'type': 'left',
        'table': {'orders': 'order'},
        'conditions': [
            ['order.user_id', '=', 'user.id']
        ]
    },
    // Repeat for each join...
]);
```


### order

Takes an *{array}* of `strings` or `objects`:

| type | comment |
|---|---|
| *{string[] / object[]}*  | `'alias.column'` / `{'alias.column': 'asc' / 'desc'}` |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.order([
    'user.id',
    {'user.first_name': 'desc'},
]);
```


### group

Takes an *{array}* of `strings`:

| type | comment |
|---|---|
| *{string[]}*  | `'alias.column'` |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.group([
    'user.age',
    'user.last_name',
]);
```


### where

Takes an *{array}* of any of the following conditions:

| type | comment |
|---|---|
| *{array}*  | `[column, operator, value]` See below for all operators. |
| *{object}* | `{or / and: []}` Closure with keyword of `or` or `and` to combine array of conditions. |
| *{string}* | Allows for advanced SQL functions. **Caution: string not escaped.** |

Returns self, chainable.

```
let query = new SimpleSqlBuilder()
.where([
    ['user.active', '=', true],
    {
        'or': [
            ['user.first_name', '=', '?'],
            ['user.last_name', '=', '?'],
        ]
    },
])
.params([
    'John',
    'Doe'
]);

// Output: WHERE `user`.`active` = 1 AND (`user`.`first_name` = 'John' OR `user`.`last_name` = 'Doe')
```

#### Operators:

- `=` Equals. `['user.age', '=', '?']`.
- `<=` Less than or equals. `['user.age', '<=', '?']`.
- `>=` More than or equals. `['user.age', '>=', '?']`.
- `<` Less than. `['user.age', '<', '?']`.
- `>` More than. `['user.age', '>', '?']`.
- `!=` Not equal. `['user.age', '!=', '?']`.
- `<>` Not equal. `['user.age', '<>', '?']`.
- `is`  _Typically used with value of_  `null`. `['user.age', 'is', null]`.
- `is not`  _Typically used with value of_  `null`. `['user.age', 'is not', null]`.
- `between` Value must be an _array_ of `["start", "end"]` values. `['user.age', 'between', ['?','?']]`.
- `in` Value must be an _{array}_ `['user.age', 'in', ['?','?','?']]`.
- `not in` Value must be an _{array}_ `['user.age', 'not in', ['?','?','?']]`.
- `contains` Performs a `LIKE` condition in which column value _contains_ given value `value`. `['user.age', 'contains', '?']`.
- `begins` Performs a `LIKE` condition in which the column value _starts_ with given `value`. `['user.age', 'beings', '?']`.
- `ends` Performs a `LIKE` conditions in which the column value _ends_ with given `value`. `['user.age', 'ends', '?']`.


### having

Takes an *{array}* of conditions. @see `where` for more information.

Returns self, chainable.


### limit

Takes either a *{number} / {array}*: `10` / `[offset, limit]`

Returns self, chainable.

```
// Limit
let query = new SimpleSqlBuilder()
.limit(10);

---

// Offset, limit
let query = new SimpleSqlBuilder()
.limit([100, 15]);
```


### params

Takes either *{array}* of values, or *{object}* of `key:value` pairs.

Returns self, chainable.

```
// Numeric array of params
let query = new SimpleSqlBuilder()
.where([
    ['user.first_name', '=', '?'],
    ['user.age', '=', '?'],
    ['user.nickname', '=', '?'],
])
.params([
    'John',
    30,
    'John',
]);

---

// Placeholder key-value params
let query = new SimpleSqlBuilder()
.where([
    ['user.first_name', '=', '?:name'],
    ['user.age', '=', '?:age'],
    ['user.nickname', '=', '?:name'],
])
.params({
    'name': 'John',
    'age': 30
});
```


### fromJson

Static method takes *{JSON}* with any of the *above public methods* as keys and returns the output of the `build` method.

Returns *{string}* The completed SQL statement.

```
let query = SimpleSqlBuilder.fromJson({
    'select': {
        'table': {'users': 'user'},
        'columns': ['user.*']
    },
    'where': [
        ['user.first_name', '=', '?'],
    ],
    'params': [
        'John'
    ],
    'limit': 10
});

console.log(query);

// Output: SELECT `user`.* FROM `users` AS `user` WHERE `user`.`first_name` = 'John' LIMIT 10
```


### build

Returns *{string}* The completed SQL statement.

```
let query = new SimpleSqlBuilder()
.select({
    'table': {'users': 'user'},
    'columns': ['user.*']
})
.where([
    ['user.first_name', '=', '?'],
])
.limit(10)
.params([
    'John',
])
.build();

console.log(query);

// Output: SELECT `user`.* FROM `users` AS `user` WHERE `user`.`first_name` = 'John' LIMIT 10
```
