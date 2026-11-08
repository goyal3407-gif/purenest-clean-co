export function Icon({ d, size = 26 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>)
}
export const ICONS = {
  sparkle: 'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',
  home: 'M3 10.5L12 3l9 7.5V21h-6v-6h-6v6H3z',
  move: 'M5 8h14M5 8l-2 12h18l-2-12M9 8V6a3 3 0 0 1 6 0v2',
  reno: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4L14 13l-3-3z',
  bed: 'M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3',
  office: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1',
  paw: 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 10a2 2 0 1 0 0-4M17 10a2 2 0 1 0 0-4M6 15a2 2 0 1 0 0-4M18 15a2 2 0 1 0 0-4M12 21c-3 0-6-2-6-4.5C6 14 9 13 12 13s6 1 6 3.5C18 19 15 21 12 21z',
  car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M5 11h14a2 2 0 0 1 2 2v3h-2.5M5 11a2 2 0 0 0-2 2v3h2.5M7 16h10M7.5 13.5h.01M16.5 13.5h.01M9 16v2m6-2v2',
  check: 'M20 6L9 17l-5-5',
  shield: 'M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  leaf: 'M11 20A7 7 0 0 1 4 13c0-4 3-8 9-9 4-.6 7 0 7 0s-.5 4-2 7c-2 4-5 9-7 9zM4 21c4-6 8-9 12-11',
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1-5.3A8.5 8.5 0 1 1 21 11.5z',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 4l8 6 8-6',
  pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  video: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  gift: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  card: 'M1 4h22v16H1zM1 10h22',
}
export function Stars({ rating = 5 }) {
  const r = Math.round(Number(rating) || 0)
  return (
    <span className="star" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (<span key={i} className={i <= r ? '' : 'empty'}>★</span>))}
    </span>
  )
}
