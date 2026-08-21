export function createId() {
    if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();

    const values = new Uint32Array(4);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values);
    else for (let index = 0; index < values.length; index += 1) values[index] = Math.floor(Math.random() * 0xffffffff);

    return `${Date.now().toString(36)}-${Array.from(values, (value) => value.toString(36)).join("-")}`;
}
