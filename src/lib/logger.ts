const startedAt = Date.now();

const stamp = () => `${((Date.now() - startedAt) / 1000).toFixed(1).padStart(7)}s`;

console.log(stamp())

export async function log(message: string) {
    console.log(`${stamp()} ${message}`);
}

