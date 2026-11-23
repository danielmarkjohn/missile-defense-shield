import { create } from 'zustand'
export const useRenderMetrics = create(() => ({ fps: 0, frameMs: 0, draws: 0, geometries: 0, textures: 0 }))
