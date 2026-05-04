/** @jsxImportSource @opentui/solid */
import { createSignal, Show } from "solid-js"
import type { TuiPlugin, TuiPluginModule, TuiPromptRef } from "@opencode-ai/plugin/tui"

const NORMAL: Record<"morning" | "day" | "evening" | "night" | "midnight", string[]> = {
  morning: [
    "Coffee's on. What are we shipping today?",
    "Early start. What's the plan?",
  ],
  day: [
    "What's up next, L?",
    "e4?",
    "g6?"
  ],
  evening: [
    "Still working, L? Let's get this done.",
  ],
  night: [
    "One more thing before bed?",
  ],
  midnight: [
    "Two years of nights have turned me into a nocturnal animal" ,
    "The city needs me",
    "People need hope to know someone is out there for them",
    "Our scars can destroy us… but if we survive them, they can transform us"
  ],
}

const SHELL = ["git command?"]

function band(): keyof typeof NORMAL {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return "morning"
  if (h >= 9 && h < 18) return "day"
  if (h >= 18 && h < 20) return "evening"
  if (h >= 20 && h < 23) return "night"
  return "midnight"
}

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

const TEXT = {
  normal: pick(NORMAL[band()]),
  shell: pick(SHELL),
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    slots: {
      home_prompt(ctx, value) {
        const { Prompt, Slot } = api.ui
        const [empty, setEmpty] = createSignal(true)
        const [mode, setMode] = createSignal<"normal" | "shell">("normal")
        let interval: ReturnType<typeof setInterval> | undefined

        const onRef = (r: TuiPromptRef | undefined) => {
          value.ref?.(r)
          if (interval) {
            clearInterval(interval)
            interval = undefined
          }
          if (!r) return
          const tick = () => {
            setEmpty((r.current.input ?? "") === "")
            setMode(r.current.mode === "shell" ? "shell" : "normal")
          }
          tick()
          interval = setInterval(tick, 60)
        }

        api.lifecycle.onDispose(() => {
          if (interval) clearInterval(interval)
        })

        return (
          <box position="relative">
            <Prompt
              ref={onRef}
              workspaceID={value.workspace_id}
              showPlaceholder={false}
              right={<Slot name="home_prompt_right" workspace_id={value.workspace_id} />}
            />
            <Show when={empty()}>
              <box position="absolute" top={1} left={3} zIndex={1}>
                <text fg={ctx.theme.current.textMuted}>
                  {mode() === "shell" ? TEXT.shell : TEXT.normal}
                </text>
              </box>
            </Show>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id: "placeholder",
  tui,
}

export default plugin
