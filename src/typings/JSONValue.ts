export type JSONPrimitiveValue = null | boolean | number | string;

export type JSONArray = (JSONPrimitiveValue | JSONArray | JSONObject)[];

export type JSONObject = {
  [key: string]: JSONPrimitiveValue | JSONObject | JSONArray;
};

export type JSONValue = JSONPrimitiveValue | JSONObject | JSONArray;
