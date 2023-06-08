/**
 *
 * @param {Array | Object | string} fields
 * @returns parsed fields
 */
function parseFields(fields) {
  if (typeof fields == "object") {
    // if given fields is an Array
    if (Array.isArray(fields))
      return fields.map((curr) => parseFields(curr)).join(" ");
    else {
      const [key, value] = Object.entries(fields)[0];
      return `${key} {${parseFields(value)}}`;
    }
  } else return fields?.toString();
}

/**
 *
 * @param {string} name API name
 * @param {Object} args arguments
 * @param {string | Object | (string|Object|Array)[]} fields fields to be returned
 * @returns query string
 */
export function constructQueryString(name, args, fields) {
  let queryString = name;

  if (args) {
    let formattedArgs = [];
    for (const key of Object.keys(args)) {
      switch (typeof args[key]) {
        //Wrap value with "" if type is string
        case "string": {
          const regex = /^"(.*)"$/;
          if (args[key].match(regex)) formattedArgs.push(`${key}:${args[key]}`);
          else formattedArgs.push(`${key}:"${args[key]}"`);
          break;
        }
        case "number":
        case "boolean":
          formattedArgs.push(`${key}:${args[key]}`);
          break;
        case "object":
          if (Array.isArray(args[key]))
            formattedArgs.push(`${key}:"${args[key].join(", ")}"`);
          else
            formattedArgs.push(
              `${key}: ${JSON.stringify(JSON.stringify(args[key]))}`
            );
          break;
        default:
          throw new Error(
            `invalid argument type: ${typeof args[key]} ${key} ${args[key]}`
          );
      }
    }
    queryString += `(${formattedArgs.join(" ")})`;
  }

  if (fields) {
    queryString += `{${parseFields(fields)}}`;
  }

  console.log(queryString);
  return queryString;
}

/**
 *
 * @param {{name: string, args: Object, fields: string | Object | (string|Object|Array)[]}|[{name: string, args: Object, fields: string | Object | (string|Object|Array)[]}]} queryData
 * @returns
 */
export function constructQuery(queryData) {
  let querySet = [];

  if (!Array.isArray(queryData)) queryData = [queryData];

  queryData.forEach((query) => {
    const { name, args, fields } = query;
    querySet.push(constructQueryString(name, args, fields));
  });
  return { data: { query: "{" + querySet.join(" ") + "}" } };
}
