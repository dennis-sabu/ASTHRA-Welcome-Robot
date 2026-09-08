# Investigation Plan: ID Card Scanning Flow

## Objectives
Investigate the ID card scanning flow in the ASTHRA project to identify potential bottlenecks and trace the image travel path.

## Tasks
- [ ] **Analyze `app/scan/ScanFlow.tsx`**
    - [ ] Trace image capture, cropping, and validation logic.
    - [ ] Analyze upload logic and backend communication.
    - [ ] Trace `Phase` state transitions and look for artificial delays (`setTimeout`).
    - [ ] Analyze `STAFF_IMAGES` and `lookupStaffImage` efficiency.
- [ ] **Analyze `app/components/RobotVoice.tsx`**
    - [ ] Examine `useRobotVoice` for blocking behavior or delays.
- [ ] **Investigate Infrastructure and Latency**
    - [ ] Check usage of `NEXT_PUBLIC_SCANNER_API_URL`.
    - [ ] Search for API proxies in `app/api`.
    - [ ] Check for `middleware.ts` or Vercel config adding latency.
- [ ] **Final Report**
    - [ ] Provide a detailed trace of the image travel path: Browser -> [proxies] -> FastAPI Backend.
    - [ ] Identify any discovered bottlenecks.

