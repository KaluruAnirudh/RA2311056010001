export function createId() {
    return `ntf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
