# Plan: Upgrade AskRobotPanel to Chat Interface

The goal is to transform the `AskRobotPanel` from a simple one-off query form into a full-fledged chat window with history, auto-scrolling, and an improved user-friendly layout, while maintaining the app's glassmorphism aesthetic.

## 1. Architectural Changes

### State Management
- Introduce a `messages` state in `AskRobotPanel`: `useState<{ role: 'user' | 'robot'; text: string }[]>( [])`.
- Use `useRobotVoice()` to access the global `state` ("idle" | "thinking" | "speaking") to show a typing indicator.
- Use a `useRef` to track the bottom of the message list for auto-scrolling.

### Message Logic
- Update `handleSubmit` to:
    1. Append user query to `messages`.
    2. Clear the input field.
    3. Dispatch `ask-robot-thinking` to trigger the robot's "thinking" state and voice line.
    4. Generate the answer using `answerAskRobot(trimmed)`.
    5. After a short delay (320ms), dispatch `ask-robot-answer` and append the robot's response to `messages`.
- Handle empty queries by adding the robot's "empty query" response to the chat history when `ask-robot-empty` is dispatched.

## 2. UI/UX Design (Tailwind CSS)

### Container & Layout
- **Outer Container**: 
    - `fixed bottom-[120px] left-4 right-4 sm:right-auto sm:max-w-[480px] z-40 animate-fade-up`.
    - Increase `max-w` from `360px` to `480px`.
- **Inner Wrapper**:
    - `flex flex-col max-h-[70vh] rounded-[20px] overflow-hidden`.
    - Glassmorphism styles: `background: rgba(15, 15, 15, 0.2)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.1)`, `box-shadow: 0 8px 40px rgba(0,0,0,0.6)`.

### Component Breakdown
- **Header**:
    - Fixed height, `flex items-center justify-between p-4 border-b border-white/10`.
    - Title: `font-sans font-semibold uppercase text-[11px] tracking-[0.18em] color: var(--accent)`.
    - Close button: Simple `✕` button with hover effect.
- **Message List**:
    - `flex-1 overflow-y-auto p-4 space-y-4`.
    - **User Bubbles**:
        - Alignment: `ml-auto`.
        - Styles: `bg-white/10 text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] text-sm`.
    - **Robot Bubbles**:
        - Alignment: `mr-auto`.
        - Styles: `bg-white/5 text-white/90 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-sm border border-white/10`.
    - **Typing Indicator**: 
        - Rendered only when `state === 'thinking'`.
        - A subtle animation or "Robot is thinking..." text in a robot bubble style.
- **Input Area**:
    - Sticky bottom: `p-4 border-t border-white/10 bg-black/20`.
    - Keep existing input styling: `bg-black/20 backdrop-blur-xl border border-white/10 rounded-[12px] p-3`.
    - Suggestions: Keep existing chip-style buttons.
    - Submit button: Maintain white background with black text.

## 3. Implementation Steps

1. **Setup State**: Add `messages` state and `scrollRef`.
2. **Build Layout**: 
    - Wrap the existing form in a `div` with `max-h-[70vh]` and `flex flex-col`.
    - Create the Header and Message List sections.
3. **Implement Message Rendering**:
    - Map `messages` to styled bubbles.
    - Integrate the `state === 'thinking'` indicator.
4. **Implement Auto-scroll**:
    - Use `useEffect` to call `scrollRef.current?.scrollIntoView({ behavior: 'smooth' })` whenever `messages` or `state` changes.
5. **Refine Submission Logic**:
    - Update `handleSubmit` to manage `messages` state in sync with `dispatch`.
6. **Polish CSS**:
    - Ensure all glassmorphism and accent colors match the existing `RobotHud` theme.

## 4. Critical Files
- `app\components\RobotHud.tsx`: The primary file for modification.
- `app\components\RobotVoice.tsx`: For context on `useRobotVoice` and state management.
- `lib\robotResponses.ts`: (Reference) To understand response patterns.
EOF`
