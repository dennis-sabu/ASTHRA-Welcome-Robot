// Mock data for the Asthra college tech fest welcome screen.
// Frontend-only — no backend, so data is in-memory.

export type Department = {
  id: string;
  name: string;
  shortName: string;
};

export type EventType = "event" | "workshop" | "competition" | "exhibition";

export type EventItem = {
  id: string;
  name: string;
  title?: string;
  description: string;
  type: EventType;
  department: string; // Department.id
  venue: string; // building / area
  room?: string; // classroom / room number
  time?: string;
  date?: string;
  day?: string;
  image?: string;
  registrationRequired?: boolean;
  registrationUrl?: string;
  coordinators?: Array<{ name: string; phone?: string }>;
};

export const departments: Department[] = [
  { id: "er", name: "Electronics and Computer Engineering", shortName: "ER" },
  { id: "cse", name: "Computer Science & Engineering", shortName: "CSE" },
  { id: "ece", name: "Electronics & Communication", shortName: "ECE" },
  { id: "eee", name: "Electrical & Electronics", shortName: "EEE" },
  { id: "mech", name: "Mechanical Engineering", shortName: "MECH" },
  { id: "civil", name: "Civil Engineering", shortName: "CIVIL" },
  { id: "it", name: "Information Technology", shortName: "IT" },
];

export const events: EventItem[] = [
  // ── Electronics and Computer Engineering (ER) Flagship Events ──
  {
    id: "er-project-expo-1",
    name: "Project Expo 1",
    title: "Project Expo 1",
    type: "exhibition",
    date: "2026-09-17",
    day: "Day 1",
    department: "er",
    description: "An exhibition showcasing innovative projects, prototypes and technical creations developed by students and innovators.",
    image: "/events/Project_expo_1_and_2.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Exhibition Block",
    time: "Day 1 · Sep 17, 2026",
    coordinators: [],
    registrationRequired: false,
    registrationUrl: "https://asthra.sjcet.in/events/AE_RKkMGviFNatRgFa49QQbZ",
  },
  {
    id: "er-project-expo-2",
    name: "Project Expo 2",
    title: "Project Expo 2",
    type: "exhibition",
    date: "2026-09-18",
    day: "Day 2",
    department: "er",
    description: "The second day of the Project Expo featuring more innovative projects, engineering prototypes and technology demonstrations.",
    image: "/events/Project_expo_1_and_2.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Exhibition Block",
    time: "Day 2 · Sep 18, 2026",
    coordinators: [],
    registrationRequired: false,
    registrationUrl: "https://asthra.sjcet.in/events/AE__uHtqhKWGcrudUMVRUUds",
  },
  {
    id: "er-iiot-network-security",
    name: "Workshop on IIoT Network Security",
    title: "Workshop on IIoT Network Security",
    type: "workshop",
    date: "2026-09-18",
    department: "er",
    description: "A technical workshop exploring Industrial Internet of Things networks, connected industrial systems and the importance of cybersecurity in modern automation.",
    image: "/events/iot_workshop.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "ER Lab",
    time: "Sep 18, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_yfqKjgQCnVCshAN2JAJZw",
  },
  {
    id: "er-diy-sim-rig",
    name: "Workshop on DIY Sim Rig",
    title: "Workshop on DIY Sim Rig",
    type: "workshop",
    date: "2026-09-17",
    department: "er",
    description: "A hands-on workshop focused on designing and building a DIY simulation rig using electronics, mechanical components and interactive systems.",
    image: "/events/workshop_on_diy_sim_ring.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Hardware Lab",
    time: "Sep 17, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_udX5c51bWYYYKcsZAq2Yv",
  },
  {
    id: "er-rhythia",
    name: "Rhythia",
    title: "Rhythia",
    type: "competition",
    date: "2026-09-17",
    department: "er",
    description: "An exciting interactive competition designed to challenge participants through creativity, coordination, technology and fast decision-making.",
    image: "/events/rhythia.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Auditorium",
    time: "Sep 17, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_h8_BnysI3Lmpx0BRvJ9qT",
  },
  {
    id: "er-ideathon",
    name: "Ideathon",
    title: "Ideathon",
    type: "competition",
    date: "2026-09-18",
    department: "er",
    description: "A competition where participants develop innovative solutions for real-world problems and present their ideas before evaluators.",
    image: "/events/ideathon.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Seminar Hall",
    time: "Sep 18, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_JH3hT_dZxpP_nSdRuSXX-",
  },
  {
    id: "er-hammer-time-2",
    name: "Hammer Time 2.0",
    title: "Hammer Time 2.0",
    type: "competition",
    date: "2026-09-17",
    department: "er",
    description: "A high-energy engineering competition that challenges participants to build, create and solve technical problems within a competitive environment.",
    image: "/events/hammer_time.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "ER Wing",
    time: "Sep 17, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_KhU2Dn2Ogo4u_kNfBjwmF",
  },
  {
    id: "er-evora-2",
    name: "Evora 2.0",
    title: "Evora 2.0",
    type: "competition",
    date: "2026-09-17",
    department: "er",
    description: "An engineering-focused competition bringing together innovation, technology and problem-solving in an exciting competitive format.",
    image: "/events/evora_2.0.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Open Arena",
    time: "Sep 17, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_jbRxZTpUW4JcaTTAIj0lC",
  },
  {
    id: "er-build-back",
    name: "Build Back",
    title: "Build Back",
    type: "competition",
    date: "2026-09-18",
    department: "er",
    description: "A creative technical competition where participants are challenged to design, reconstruct and develop innovative engineering solutions.",
    image: "/events/build_back.webp",
    venue: "Electronics and Computer Engineering Department",
    room: "Robotics Arena",
    time: "Sep 18, 2026",
    coordinators: [],
    registrationRequired: true,
    registrationUrl: "https://asthra.sjcet.in/events/AE_2gHzaA7FOZ2uFCLi7thUi",
  },

];

export function getEvent(id: string): EventItem | undefined {
  return events.find((e) => e.id === id);
}

export function getDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
