// Mock data for the Asthra college tech fest welcome screen.
// Frontend-only — no backend, so data is in-memory.

export type Department = {
  id: string;
  name: string;
  shortName: string;
};

export type EventItem = {
  id: string;
  name: string;
  description: string;
  type: "event" | "workshop";
  department: string; // Department.id
  venue: string; // building / area
  room: string; // classroom / room number
  time: string;
};

export type Student = {
  id: string;
  name: string;
  department: string;
  year: string;
};

export const departments: Department[] = [
  { id: "cse", name: "Computer Science & Engineering", shortName: "CSE" },
  { id: "ece", name: "Electronics & Communication", shortName: "ECE" },
  { id: "eee", name: "Electrical & Electronics", shortName: "EEE" },
  { id: "mech", name: "Mechanical Engineering", shortName: "MECH" },
  { id: "civil", name: "Civil Engineering", shortName: "CIVIL" },
  { id: "it", name: "Information Technology", shortName: "IT" },
];

export const events: EventItem[] = [
  {
    id: "codex",
    name: "CodeX — 24hr Hackathon",
    description: "Build a working prototype in 24 hours. Teams of up to 4. Prizes worth ₹1 lakh.",
    type: "event",
    department: "cse",
    venue: "Main Block, Ground Floor",
    room: "Lab 101 & 102",
    time: "Starts 09:00",
  },
  {
    id: "cipher",
    name: "Cipher CTF",
    description: "Reverse engineering, web exploitation, cryptography — test your security skills.",
    type: "event",
    department: "cse",
    venue: "Main Block, First Floor",
    room: "Lab 204",
    time: "10:00 – 16:00",
  },
  {
    id: "roborace",
    name: "Robo Race",
    description: "Build a wired/wireless bot and race it through an obstacle track.",
    type: "event",
    department: "mech",
    venue: "Mechanical Block, Workshop Wing",
    room: "Workshop B",
    time: "11:00 – 15:00",
  },
  {
    id: "line-follower",
    name: "Line Follower Challenge",
    description: "Fastest bot through the twisty line wins. Bring your own bot or assemble on-site.",
    type: "event",
    department: "ece",
    venue: "Electronics Block, Ground Floor",
    room: "Lab 110",
    time: "13:00 – 17:00",
  },
  {
    id: "circuit-debug",
    name: "Circuit Debugging",
    description: "Debug hardware and identify faults on a custom-built PCB. Solo or duo.",
    type: "workshop",
    department: "ece",
    venue: "Electronics Block, First Floor",
    room: "Lab 211",
    time: "09:30 – 12:30",
  },
  {
    id: "ai-ml",
    name: "AI/ML Workshop — Build a Chatbot",
    description: "Hands-on workshop covering LLMs, embeddings, and a deployed chatbot by the end.",
    type: "workshop",
    department: "cse",
    venue: "Main Block, Third Floor",
    room: "Lab 305",
    time: "10:00 – 13:00",
  },
  {
    id: "bridge-design",
    name: "Bridge Design Contest",
    description: "Design a truss bridge model and load-test it. Material provided on-site.",
    type: "event",
    department: "civil",
    venue: "Civil Block, Hall A",
    room: "Hall 1A",
    time: "11:30 – 14:30",
  },
  {
    id: "power-quest",
    name: "Power Quest",
    description: "A quiz on power systems, machines, and renewable energy.",
    type: "event",
    department: "eee",
    venue: "EEE Block, Seminar Hall",
    room: "Seminar Hall 1",
    time: "12:00 – 13:30",
  },
  {
    id: "web3",
    name: "Web3 & Solidity Bootcamp",
    description: "Write, test, and deploy your first smart contract on a testnet.",
    type: "workshop",
    department: "it",
    venue: "IT Block, First Floor",
    room: "Lab 108",
    time: "14:00 – 17:00",
  },
  {
    id: "ideathon",
    name: "Ideathon — Pitch Your Startup",
    description: "Present a 5-minute pitch to a panel of founders and faculty.",
    type: "event",
    department: "it",
    venue: "IT Block, Auditorium",
    room: "Auditorium",
    time: "15:00 – 17:00",
  },
  {
    id: "poster",
    name: "Poster Presentation",
    description: "Showcase your research. Open to all departments and years.",
    type: "event",
    department: "cse",
    venue: "Main Block, Foyer",
    room: "Foyer (Open Area)",
    time: "All day",
  },
  {
    id: "drone",
    name: "Drone Workshop",
    description: "Assemble and fly a quadcopter. Pre-registration required.",
    type: "workshop",
    department: "mech",
    venue: "Mechanical Block, Open Ground",
    room: "Open Ground (East)",
    time: "09:00 – 12:00",
  },
];

// Mock students that can be "detected" when scanning an ID.
// In a real system this would come from a backend or QR/barcode decode.
export const students: Student[] = [
  { id: "ASTH001", name: "Aarav Sharma", department: "Computer Science & Engineering", year: "3rd Year" },
  { id: "ASTH002", name: "Diya Krishnan", department: "Electronics & Communication", year: "2nd Year" },
  { id: "ASTH003", name: "Rohan Mehta", department: "Mechanical Engineering", year: "4th Year" },
  { id: "ASTH004", name: "Sneha Iyer", department: "Information Technology", year: "3rd Year" },
  { id: "ASTH005", name: "Karthik Reddy", department: "Electrical & Electronics", year: "2nd Year" },
  { id: "ASTH006", name: "Priya Nair", department: "Civil Engineering", year: "1st Year" },
];

export function getEvent(id: string): EventItem | undefined {
  return events.find((e) => e.id === id);
}

export function getDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}

export function getStudent(id: string): Student | undefined {
  return students.find((s) => s.id.toLowerCase() === id.toLowerCase());
}
