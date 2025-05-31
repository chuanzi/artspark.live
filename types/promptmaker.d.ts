declare module 'promptmaker' {
  interface PromptmakerOptions {
    medium?: string | null
    subject?: string | null
    artist?: string | null
    movement?: string | null
    flavors?: string[] | null
  }

  interface PromptmakerFunction {
    (options?: PromptmakerOptions): string
    mediums: string[]
    subjects: string[]
    artists: string[]
    movements: string[]
    flavors: string[]
  }

  const promptmaker: PromptmakerFunction
  export default promptmaker
} 