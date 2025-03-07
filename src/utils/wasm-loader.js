let wasmModule = null;

export async function initWasm() {
  try {
    const module = await import('../wasm/gis_ops/pkg');
    wasmModule = module;
    console.log('WebAssembly module loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load WebAssembly module:', error);
    return false;
  }
}

export function getWasmModule() {
  if (!wasmModule) {
    throw new Error('WebAssembly module not initialized');
  }
  return wasmModule;
} 