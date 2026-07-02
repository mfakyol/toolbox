// Generates TypeScript type definitions from a JSON value.
// Separate interfaces for nested objects, element-type inference for arrays,
// unions for mixed types and optional (?) for fields missing in some array items.

export type DeclStyle = "interface" | "type";

export interface JsonToTsOptions {
  rootName?: string;
  style?: DeclStyle;
}

type Kind = "string" | "number" | "boolean" | "array" | "object" | "null";

function kindOf(v: unknown): Kind {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "object") return "object";
  return t as Kind;
}

function pascalCase(key: string): string {
  const parts = key.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  let name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  if (!name) name = "Field";
  if (/^[0-9]/.test(name)) name = "_" + name;
  return name;
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, "y");
  if (/ses$/i.test(name)) return name.replace(/es$/i, "");
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.slice(0, -1);
  return name;
}

function isValidIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function unionOf(parts: string[]): string {
  const uniq = [...new Set(parts)];
  return uniq.join(" | ");
}

interface Field {
  key: string;
  optional: boolean;
  type: string;
}

interface Ctx {
  order: string[]; // registration order
  bodies: Map<string, Field[]>; // isim -> alanlar
  signatures: Map<string, string>; // name -> signature (for dedupe)
}

// Reduces samples of the same kind to a single type.
function inferSameKind(values: unknown[], name: string, ctx: Ctx): string {
  const kind = kindOf(values[0]);

  if (kind === "array") {
    const elements = (values as unknown[][]).flat();
    if (elements.length === 0) return "unknown[]";
    const elemType = infer(elements, singularize(name), ctx);
    return /[| ]/.test(elemType) ? `(${elemType})[]` : `${elemType}[]`;
  }

  if (kind === "object") {
    return buildInterface(values as Record<string, unknown>[], name, ctx);
  }

  return kind; // string | number | boolean
}

// Builds a type expression from a list of samples (folds nulls into the union).
function infer(values: unknown[], name: string, ctx: Ctx): string {
  const nonNull = values.filter((v) => v !== null);
  const hasNull = values.some((v) => v === null);

  if (nonNull.length === 0) return hasNull ? "null" : "unknown";

  const kinds = new Set(nonNull.map(kindOf));
  let type: string;

  if (kinds.size > 1) {
    const parts: string[] = [];
    for (const k of kinds) {
      const subset = nonNull.filter((v) => kindOf(v) === k);
      parts.push(inferSameKind(subset, name, ctx));
    }
    type = unionOf(parts);
  } else {
    type = inferSameKind(nonNull, name, ctx);
  }

  return hasNull ? unionOf([type, "null"]) : type;
}

// Merges one or more objects into a single interface.
function buildInterface(
  objects: Record<string, unknown>[],
  preferredName: string,
  ctx: Ctx
): string {
  // Preserve field order: start from the first object, then add new keys.
  const keys: string[] = [];
  for (const obj of objects) {
    for (const k of Object.keys(obj)) {
      if (!keys.includes(k)) keys.push(k);
    }
  }

  const fields: Field[] = keys.map((key) => {
    const present = objects.filter((o) => Object.prototype.hasOwnProperty.call(o, key));
    const values = present.map((o) => o[key]);
    const type = infer(values, pascalCase(key), ctx);
    return {
      key,
      optional: present.length < objects.length,
      type,
    };
  });

  return register(preferredName, fields, ctx);
}

// Registers the interface; if the same name clashes with a different body, appends a number.
function register(preferredName: string, fields: Field[], ctx: Ctx): string {
  const signature = JSON.stringify(fields);

  let name = preferredName;
  let n = 1;
  while (ctx.signatures.has(name)) {
    if (ctx.signatures.get(name) === signature) return name; // exact match
    n += 1;
    name = `${preferredName}${n}`;
  }

  ctx.signatures.set(name, signature);
  ctx.bodies.set(name, fields);
  ctx.order.push(name);
  return name;
}

function renderField(field: Field): string {
  const key = isValidIdentifier(field.key) ? field.key : JSON.stringify(field.key);
  return `  ${key}${field.optional ? "?" : ""}: ${field.type};`;
}

function renderDecl(name: string, fields: Field[], style: DeclStyle): string {
  const body = fields.map(renderField).join("\n");
  if (style === "type") {
    return `export type ${name} = {\n${body}\n};`;
  }
  return `export interface ${name} {\n${body}\n}`;
}

/**
 * Converts JSON text into TypeScript type definitions.
 * Throws on invalid JSON.
 */
export function jsonToTypescript(
  jsonText: string,
  options: JsonToTsOptions = {}
): string {
  const rootName = pascalCase(options.rootName || "Root");
  const style = options.style ?? "interface";

  const parsed = JSON.parse(jsonText) as unknown;

  const ctx: Ctx = {
    order: [],
    bodies: new Map(),
    signatures: new Map(),
  };

  const rootType = infer([parsed], rootName, ctx);

  // If the root isn't an object/array (e.g. a plain string), emit a simple type alias.
  if (ctx.order.length === 0) {
    return `export type ${rootName} = ${rootType};`;
  }

  // Put the root interface first, keep the rest in registration order.
  const ordered = [...ctx.order];
  const rootFinal = ordered.includes(rootName) ? rootName : ordered[ordered.length - 1];
  const rest = ordered.filter((n) => n !== rootFinal);
  const finalOrder = [rootFinal, ...rest];

  const decls = finalOrder.map((name) =>
    renderDecl(name, ctx.bodies.get(name)!, style)
  );

  // If the root is an array, also add an alias (e.g. export type Root = Item[];).
  if (rootType !== rootFinal) {
    decls.push(`export type ${rootName}List = ${rootType};`);
  }

  return decls.join("\n\n");
}
