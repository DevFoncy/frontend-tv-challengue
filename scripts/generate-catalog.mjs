#!/usr/bin/env node
/**
 * Generates the STREAMBOX mock catalog and its artwork.
 *
 *   node scripts/generate-catalog.mjs
 *
 * Output (deterministic for a given SEED):
 *   src/data/movies.json             catalog records
 *   public/images/posters/<id>.svg   2:3 poster artwork
 *   public/images/backdrops/<id>.svg 16:9 backdrop artwork
 *
 * All titles, descriptions and artwork are fictional and generated locally.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = 20180611;
const VIDEOS = ['/videos/streambox-demo-a.mp4', '/videos/streambox-demo-b.mp4'];

// ---------------------------------------------------------------------------
// Deterministic random helpers
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);
const pick = (items) => items[Math.floor(rand() * items.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// ---------------------------------------------------------------------------
// Genre definitions
// ---------------------------------------------------------------------------

const GENRES = {
  Action: {
    count: 40,
    duration: [92, 148],
    palette: ['#1a0707', '#b4380f', '#fbbf24'],
    motifs: ['sun', 'skyline', 'stripes'],
    titles: [
      () => `${pick(['Iron', 'Steel', 'Crimson', 'Rogue', 'Burning', 'Shattered', 'Midnight', 'Cold', 'Rapid', 'Hollow', 'Final', 'Copper'])} ${pick(['Protocol', 'Horizon', 'Vendetta', 'Extraction', 'Directive', 'Fault Line', 'Pursuit', 'Siege', 'Velocity', 'Countdown', 'Payload', 'Recoil', 'Ricochet', 'Crossfire'])}`,
      () => `Operation ${pick(['Tidewater', 'Nightjar', 'Basilisk', 'Long Shadow', 'Blue Harvest', 'Granite', 'Kestrel', 'Silver Lining', 'Wildfire', 'Monsoon'])}`,
      () => `${pick(['Zero', 'Red', 'Black', 'Dead', 'Last'])} ${pick(['Hour', 'Signal', 'Run', 'Contact', 'Exit', 'Mile', 'Drop', 'Light'])}`,
    ],
    leads: ['a former customs agent', 'an off-duty paramedic', 'a getaway driver with one last debt', 'a demolition expert', 'a disgraced bodyguard', 'two rival couriers', 'a retired stunt pilot', 'a harbour patrol officer'],
    plots: ['must outrun a private army', 'is pulled into a heist that goes sideways', 'has six hours to stop a stolen shipment', 'becomes the only witness to a rooftop ambush', 'races to recover a hijacked train', 'goes undercover inside a smuggling ring'],
    places: ['the flooded streets of Lisbon', 'a high-speed rail line across the Alps', 'a container port at midnight', 'the desert highways outside Tucson', 'a skyscraper under lockdown', 'the canals of Rotterdam'],
    hooks: ['Every second counts.', 'There is no backup and no second chance.', 'Trust is the first casualty.', 'The clock started before anyone noticed.'],
  },
  Adventure: {
    count: 30,
    duration: [96, 152],
    palette: ['#0c2418', '#2f855a', '#f6e05e'],
    motifs: ['mountains', 'sun', 'rings'],
    titles: [
      () => `The ${pick(['Amber', 'Northern', 'Sunken', 'Painted', 'Forgotten', 'Silver', 'Hidden', 'Burning'])} ${pick(['Expedition', 'Passage', 'Archipelago', 'Map', 'Compass', 'Atlas', 'Caravan', 'Frontier'])}`,
      () => `Beyond the ${pick(['Salt Flats', 'Cloud Line', 'Jade River', 'Ninth Ridge', 'Iron Coast', 'Glacier', 'Red Canyon', 'Last Dune'])}`,
      () => `${pick(['Quest', 'Voyage', 'Trail', 'Flight', 'Road'])} to ${pick(['Kerrigan Point', 'Port Albion', 'the Hollow Isles', 'Mount Ostra', 'Valdera', 'the Sapphire Gate'])}`,
    ],
    leads: ['a reluctant mountain guide', 'a teenage cartographer', 'a widowed balloonist', 'a crew of salvage divers', 'an exiled river pilot', 'two estranged siblings'],
    plots: ['follows a century-old map', 'sets out to find a vanished research ship', 'crosses uncharted terrain on a promise', 'searches for a legendary waterfall', 'joins a race no one has ever finished'],
    places: ['the Patagonian ice fields', 'a chain of volcanic islands', 'the cloud forests of Monteverde', 'the dunes of the Empty Quarter', 'a forgotten Arctic trade route'],
    hooks: ['The map was only the beginning.', 'Some places refuse to be found.', 'The journey changes everyone who survives it.'],
  },
  'Sci-Fi': {
    count: 36,
    duration: [94, 158],
    palette: ['#070b22', '#2f5fe0', '#67e8f9'],
    motifs: ['rings', 'grid', 'sun'],
    titles: [
      () => `${pick(['Helio', 'Astra', 'Vanta', 'Quanta', 'Lumen', 'Orbi', 'Nova', 'Exo', 'Cryo', 'Synth'])}${pick(['form', 'line', 'drift', 'fall', 'gate', 'core', 'shift', 'field', 'point', 'wave'])}`,
      () => `Signal from ${pick(['Kepler Deep', 'Station Nine', 'the Outer Belt', 'Tau Ceti', 'the Far Array', 'Proxima Low'])}`,
      () => `The ${pick(['Second', 'Silent', 'Hollow', 'Last', 'Seventh', 'Glass'])} ${pick(['Orbit', 'Colony', 'Equation', 'Satellite', 'Frequency', 'Machine', 'Eclipse'])}`,
      () => `Station ${pick(['Theta', 'Kappa', 'Sigma', 'Omicron', 'Lambda', 'Epsilon'])}`,
    ],
    leads: ['a junior flight engineer', 'an android archivist', 'the last crew of a mining vessel', 'a quantum physicist', 'a colony doctor', 'an orbital traffic controller'],
    plots: ['receives a message from the future', 'discovers the colony was never meant to be found', 'must repair a failing generation ship', 'wakes up decades early from cryosleep', 'decodes a pattern hidden in solar flares'],
    places: ['a research station orbiting Europa', 'a terraformed Mars in 2240', 'a megacity built inside a crater', 'the edge of the solar system', 'a drifting space elevator'],
    hooks: ['The answer was written in the stars.', 'Humanity gets one chance to listen.', 'What came back is not what left.'],
  },
  Fantasy: {
    count: 24,
    duration: [98, 160],
    palette: ['#170c2e', '#7c3aed', '#f0abfc'],
    motifs: ['mountains', 'rings', 'sun'],
    titles: [
      () => `The ${pick(['Ember', 'Thorn', 'Willow', 'Ashen', 'Moonlit', 'Iron', 'Glass'])} ${pick(['Crown', 'Throne', 'Oath', 'Lantern', 'Key', 'Harp', 'Gate'])}`,
      () => `Song of the ${pick(['Stag', 'Salt Witch', 'Tidebound', 'Winter Fox', 'Dragonfly', 'Stone Giant'])}`,
      () => `${pick(['Realm', 'Heirs', 'Keeper', 'Shadow', 'Ballad'])} of ${pick(['Elderglen', 'Corvane', 'the Mist Vale', 'Ashenmoor', 'Sunhallow', 'the Seven Bells'])}`,
    ],
    leads: ['an apprentice clockmaker', 'a banished knight', 'a young lighthouse keeper', 'a fox who can speak', 'the youngest of three heirs', 'a librarian of forbidden books'],
    plots: ['inherits a key that opens any door', 'must return a stolen star to the sky', 'breaks an ancient pact by accident', 'is chosen by a dying dragon', 'bargains with the spirit of a forest'],
    places: ['a kingdom where winter never ends', 'a city carried on the back of a turtle', 'an enchanted archipelago', 'the borderlands of the fae'],
    hooks: ['Every spell has a price.', 'Legends are only the beginning.', 'Magic remembers everything.'],
  },
  Drama: {
    count: 52,
    duration: [96, 150],
    palette: ['#1d1714', '#8a3d1a', '#fde68a'],
    motifs: ['sun', 'stripes', 'skyline'],
    titles: [
      () => `${pick(['Winter', 'August', 'Autumn', 'Spring', 'Summer'])} in ${pick(['Valparaíso', 'Galway', 'Kraków', 'Porto', 'Sapporo', 'Marseille', 'Tbilisi', 'Halifax', 'Bergen', 'Cádiz'])}`,
      () => `What the ${pick(['River', 'Garden', 'House', 'Ocean', 'Orchard', 'Snow', 'Tide'])} ${pick(['Remembers', 'Keeps', 'Forgave', 'Carried', 'Knew'])}`,
      () => `The ${pick(['Weaver', 'Piano Tuner', 'Glassblower', 'Night Nurse', 'Beekeeper', 'Ferryman', 'Bookbinder', 'Lighthouse Keeper'])}'s ${pick(['Daughter', 'Son', 'Promise', 'Letter', 'Summer', 'Secret'])}`,
      () => `${pick(['Small', 'Quiet', 'Borrowed', 'Paper', 'Open', 'Distant'])} ${pick(['Hours', 'Rooms', 'Victories', 'Mercies', 'Windows', 'Harbours'])}`,
    ],
    leads: ['a retired opera singer', 'two estranged brothers', 'a single parent working night shifts', 'a village doctor', 'a young immigrant chef', 'a widowed fisherman', 'a high-school music teacher'],
    plots: ['returns home after twenty years', 'confronts a long-buried family secret', 'fights to keep a failing bookshop open', 'takes in a stranger during a storm', 'rebuilds a life after a quiet tragedy'],
    places: ['a coastal town in Portugal', 'post-war Vienna', 'a small farm in Saskatchewan', 'a crowded Mumbai apartment block', 'a fading seaside resort'],
    hooks: ['Some wounds heal in silence.', 'Home is never quite where it was left.', 'A story about the things we carry.'],
  },
  Comedy: {
    count: 44,
    duration: [84, 118],
    palette: ['#2e0a4f', '#e0820b', '#fef3c7'],
    motifs: ['rings', 'stripes', 'grid'],
    titles: [
      () => `Dinner with the ${pick(['Abernathys', 'Okonkwos', 'Lindqvists', 'Moreaus', 'Patels', 'Fitzgeralds', 'Takahashis', 'Delgados'])}`,
      () => `My ${pick(['Aunt', 'Neighbour', 'Landlord', 'Cousin', 'Boss', 'Ex'])}'s ${pick(['Wedding', 'Parrot', 'Food Truck', 'Reunion', 'Inheritance', 'Karaoke Night', 'Campervan'])}`,
      () => `The ${pick(['Accidental', 'Reluctant', 'Overqualified', 'Temporary', 'Unlikely', 'Part-Time'])} ${pick(['Intern', 'Mayor', 'Bridesmaid', 'Detective', 'Influencer', 'Ghostwriter', 'Lifeguard'])}`,
      () => `${pick(['Totally', 'Mostly', 'Almost', 'Strictly', 'Technically'])} ${pick(['Fine', 'Married', 'Famous', 'Legal', 'Retired', 'Prepared'])}`,
    ],
    leads: ['an overworked wedding planner', 'two rival food-truck owners', 'a substitute teacher', 'a family of competitive bakers', 'a failed magician', 'three best friends turning forty'],
    plots: ['accidentally books the same venue twice', 'pretends to be engaged for a weekend', 'inherits a goat farm with conditions', 'enters a talent show to save the community centre', 'gets stuck on the world’s slowest road trip'],
    places: ['a chaotic seaside town', 'suburban New Jersey', 'a ski resort in the off-season', 'a cruise ship with a broken engine'],
    hooks: ['What could possibly go wrong?', 'Family is complicated. Weddings are worse.', 'Nothing goes according to plan.'],
  },
  Thriller: {
    count: 36,
    duration: [92, 138],
    palette: ['#080c11', '#334155', '#e2e8f0'],
    motifs: ['grid', 'stripes', 'skyline'],
    titles: [
      () => `The ${pick(['Glass', 'Quiet', 'Ninth', 'Locked', 'Blue', 'Paper', 'Mirror'])} ${pick(['Room', 'Witness', 'Floor', 'Hour', 'Window', 'Archive', 'Corridor'])}`,
      () => `Night ${pick(['Shift', 'Ferry', 'Crossing', 'Signal', 'Watch', 'Freight'])}`,
      () => `${pick(['Forty', 'Ninety', 'Twelve', 'Seventeen', 'Thirty'])} ${pick(['Minutes', 'Floors', 'Miles', 'Seconds'])} ${pick(['to Midnight', 'Down', 'Out', 'Apart'])}`,
      () => `${pick(['Northbound', 'Undertow', 'Blind', 'Static', 'Afterimage'])} ${pick(['Signal', 'Witness', 'Line', 'Protocol', 'Echo'])}`,
    ],
    leads: ['a hospital night nurse', 'a forensic accountant', 'a radio host', 'a court stenographer', 'an air-traffic controller', 'a true-crime podcaster'],
    plots: ['receives a call that should be impossible', 'notices the same stranger in every photograph', 'uncovers a pattern in a decade of cold cases', 'is trapped in a building with a killer', 'realises a trusted colleague is lying'],
    places: ['a snowbound mountain hotel', 'a sleeper train across Europe', 'a small town with one road out', 'an empty corporate tower'],
    hooks: ['Nobody is who they seem.', 'The truth has a body count.', 'Look closer.'],
  },
  Crime: {
    count: 24,
    duration: [98, 152],
    palette: ['#0f1219', '#7f1d1d', '#fca5a5'],
    motifs: ['skyline', 'stripes', 'grid'],
    titles: [
      () => `The ${pick(['Marseille', 'Baltimore', 'Antwerp', 'Naples', 'Glasgow', 'Montreal', 'Osaka'])} ${pick(['Job', 'Ledger', 'Connection', 'Accord', 'Arrangement'])}`,
      () => `${pick(['Calloway', 'Brennan', 'Vasquez', 'Okafor', 'Halloran', 'DeLuca'])} & ${pick(['Sons', 'Daughters', 'Partners', 'Associates'])}`,
      () => `${pick(['Dirty', 'Borrowed', 'Velvet', 'Counterfeit', 'Loaded'])} ${pick(['Money', 'Getaway', 'Blues', 'Diamonds', 'Alibi', 'Ledger'])}`,
    ],
    leads: ['a veteran homicide detective', 'a family of art forgers', 'a public defender', 'a getaway driver turned informant', 'an insurance investigator'],
    plots: ['chases a thief who leaves no fingerprints', 'is drawn into one final job', 'unravels a city-wide corruption scheme', 'tries to go straight after a decade inside'],
    places: ['1970s Marseille', 'the docks of Baltimore', 'a sun-bleached Miami', 'a rain-soaked Glasgow'],
    hooks: ['Everyone has a price.', 'Crime pays — until it doesn’t.', 'The past always collects.'],
  },
  Animation: {
    count: 24,
    duration: [82, 108],
    palette: ['#0a3a57', '#14b8d4', '#fde047'],
    motifs: ['rings', 'sun', 'mountains'],
    titles: [
      () => `${pick(['Pip', 'Juniper', 'Otto', 'Mabel', 'Bixby', 'Luna', 'Ziggy', 'Clementine'])} the ${pick(['Brave', 'Inventor', 'Lighthouse Mouse', 'Cloud Painter', 'Tiny Knight', 'Star Catcher'])}`,
      () => `Captain ${pick(['Puddle', 'Marmalade', 'Whiskers', 'Biscuit', 'Comet'])} and the ${pick(['Moon Map', 'Missing Kite', 'Thunder Egg', 'Upside-Down Sea', 'Paper Planet'])}`,
      () => `The ${pick(['Little', 'Very Small', 'Brightest', 'Sleepy', 'Clockwork'])} ${pick(['Robot', 'Dragon', 'Giant', 'Volcano', 'Snowflake', 'Submarine'])}`,
    ],
    leads: ['a curious young robot', 'a lighthouse mouse', 'a shy dragon', 'a family of hedgehogs', 'an eight-year-old inventor'],
    plots: ['sets out to find the end of the rainbow', 'must save the town festival', 'befriends a cloud that cannot rain', 'builds a rocket from kitchen spoons'],
    places: ['a village in the treetops', 'an underwater city', 'a planet made of candy', 'a sleepy harbour town'],
    hooks: ['Fun for the whole family.', 'Big adventures come in small packages.', 'Friendship is the real superpower.'],
  },
  Romance: {
    count: 26,
    duration: [90, 126],
    palette: ['#3a0b21', '#d0246f', '#fbcfe8'],
    motifs: ['sun', 'rings', 'stripes'],
    titles: [
      () => `Letters to ${pick(['Amélie', 'Rafael', 'Ingrid', 'Matteo', 'Noor', 'Theo', 'Isadora', 'Kenji'])}`,
      () => `${pick(['Paper Lanterns', 'Last Train', 'Rooftops', 'Sunday Mornings', 'Two Tickets', 'Postcards'])} ${pick(['Over Oslo', 'to Lyon', 'in Havana', 'in Kyoto', 'from Rome', 'to Lisbon'])}`,
      () => `The ${pick(['Golden', 'Borrowed', 'Long', 'Sweetest', 'Lost', 'Blue'])} ${pick(['Hours', 'Summer', 'Season', 'Weekend', 'Promise'])}`,
    ],
    leads: ['a florist and a jazz pianist', 'two strangers sharing a delayed flight', 'childhood pen pals', 'a translator and a celebrity chef', 'rival architects'],
    plots: ['keep meeting by accident', 'fall in love over a single summer', 'reconnect after ten years apart', 'agree to a pretend relationship'],
    places: ['the vineyards of Tuscany', 'a snowy Montreal winter', 'a bookshop in Paris', 'a coastal town in Ireland'],
    hooks: ['Love arrives on its own schedule.', 'Some stories are worth waiting for.', 'A second chance at a first love.'],
  },
  Horror: {
    count: 24,
    duration: [86, 116],
    palette: ['#050505', '#3d1414', '#ef4444'],
    motifs: ['mountains', 'grid', 'skyline'],
    titles: [
      () => `The ${pick(['Thing', 'House', 'Voice', 'Hunger', 'Well', 'Choir'])} Beneath`,
      () => `${pick(['Hollow', 'Raven', 'Blackthorn', 'Weeping', 'Cinder'])} ${pick(['Pines', 'Hill', 'Marsh', 'Farm', 'Lake'])}`,
      () => `Don't ${pick(['Open', 'Answer', 'Wake', 'Follow', 'Look Behind'])} the ${pick(['Door', 'Phone', 'Lighthouse', 'Dollhouse', 'Cellar', 'Mirror'])}`,
      () => `The ${pick(['Thirteenth', 'Ninth', 'Final', 'Longest', 'Silent'])} Night`,
    ],
    leads: ['a group of college friends', 'a newly married couple', 'a paranormal investigator', 'a night-shift security guard', 'a family that just moved in'],
    plots: ['rents a cabin with a terrible history', 'hears whispering inside the walls', 'finds a tape that should not exist', 'awakens something under the lake'],
    places: ['a remote Scottish island', 'an abandoned asylum', 'a forest that swallows sound', 'a Victorian farmhouse'],
    hooks: ['Some doors should stay closed.', 'It has been waiting.', 'Do not turn off the lights.'],
  },
  Documentary: {
    count: 40,
    duration: [48, 104],
    palette: ['#0b1c13', '#4d7c0f', '#ecfccb'],
    motifs: ['mountains', 'sun', 'rings'],
    titles: [
      () => `${pick(['Deep Blue', 'High Altitude', 'Wild Coast', 'Night Shift', 'Frozen', 'Silent Forest', 'Living Desert', 'Urban Wild'])}: ${pick(['A Year Unseen', 'The Untold Story', 'Life on the Edge', 'Beneath the Surface', 'The Last Frontier', 'Into the Unknown'])}`,
      () => `Inside the ${pick(['Hive', 'Orchestra', 'Kitchen', 'Glacier', 'Newsroom', 'Observatory', 'Factory', 'Rainforest'])}`,
      () => `Voices of ${pick(['the Andes', 'the Sahel', 'the Arctic', 'the Mekong', 'Appalachia', 'the Steppe'])}`,
      () => `Made by ${pick(['Hand', 'Fire', 'Water', 'Machines', 'Light'])}`,
    ],
    leads: ['marine biologists', 'a family of beekeepers', 'a symphony orchestra', 'glaciologists', 'street-food vendors', 'wildlife rangers'],
    plots: ['spend a year documenting a fragile ecosystem', 'reveal the craft behind a centuries-old tradition', 'follow a season of extraordinary change', 'race to record a disappearing world'],
    places: ['the coral reefs of Raja Ampat', 'the Greenland ice sheet', 'the markets of Bangkok', 'the forests of Borneo', 'the Atacama Desert'],
    hooks: ['Narrated by the people who live it.', 'Filmed over four years.', 'A rare look behind the curtain.'],
  },
};

// Hand-written editorial titles used for the hero and Trending row.
const FEATURED = [
  { title: 'The Glass Meridian', genre: 'Sci-Fi', releaseYear: 2025, duration: 138, rating: 8.7, description: 'When a decommissioned orbital observatory starts predicting earthquakes hours before they happen, a seismologist and a disgraced satellite engineer must decide who gets warned first — and who is quietly left behind.' },
  { title: 'Northbound Static', genre: 'Thriller', releaseYear: 2025, duration: 121, rating: 8.3, description: 'A late-night radio host begins receiving calls from listeners who describe crimes that have not happened yet. The closer the broadcasts get to the truth, the fewer people believe them.' },
  { title: 'Embers of Calloway', genre: 'Drama', releaseYear: 2024, duration: 132, rating: 8.5, description: 'Three generations of a mining family gather for one last winter in the town their grandfather built, as old loyalties and older secrets surface with the snowmelt.' },
  { title: 'Paper Lanterns Over Oslo', genre: 'Romance', releaseYear: 2024, duration: 109, rating: 7.9, description: 'A lighting designer and a stranded cellist share a single unforgettable week during the longest nights of the Norwegian winter.' },
  { title: 'The Last Cartographer', genre: 'Adventure', releaseYear: 2025, duration: 144, rating: 8.4, description: 'A teenage mapmaker inherits a hand-drawn atlas of places that do not exist — until the first of them appears on the horizon.' },
  { title: 'Velvet Getaway', genre: 'Crime', releaseYear: 2024, duration: 118, rating: 8.0, description: 'A retired jewel thief is coaxed back for one elegant final job in 1970s Monaco, but the crew she assembles has plans of its own.' },
  { title: 'Kingdom of Small Things', genre: 'Documentary', releaseYear: 2025, duration: 92, rating: 8.9, description: 'Filmed over four years with custom macro cameras, an astonishing journey into the hidden lives of the insects that keep our world turning.' },
  { title: 'Moonrise Mechanics', genre: 'Animation', releaseYear: 2024, duration: 98, rating: 8.1, description: 'An eight-year-old inventor and a lonely maintenance robot team up to fix the broken machine that raises the moon every night.' },
  { title: 'Hollow Pines', genre: 'Horror', releaseYear: 2025, duration: 104, rating: 7.6, description: 'A family moves into a lakeside cabin where the forest goes completely silent every night at 3:17 a.m.' },
  { title: 'Saltwater Sprint', genre: 'Action', releaseYear: 2025, duration: 126, rating: 7.8, description: 'An off-duty coast guard pilot has one stormy night to recover a hijacked ferry before it reaches international waters.' },
  { title: 'The Ninth Lighthouse', genre: 'Fantasy', releaseYear: 2024, duration: 141, rating: 8.2, description: 'On an archipelago where every lighthouse guards a different season, a young keeper must relight the one that holds back eternal winter.' },
  { title: 'Dinner for Eleven', genre: 'Comedy', releaseYear: 2025, duration: 101, rating: 7.7, description: 'A meticulous chef has one evening to host the in-laws, the ex, the landlord and a food critic — all at the same table.' },
];

// ---------------------------------------------------------------------------
// Catalog generation
// ---------------------------------------------------------------------------

function generateYear() {
  // Weighted towards recent releases.
  return 2026 - Math.floor(Math.pow(rand(), 1.7) * 30);
}

function generateRating() {
  const value = 5.6 + (rand() + rand() + rand()) / 3 * 3.6;
  return Math.round(value * 10) / 10;
}

function generateDescription(genre) {
  const g = GENRES[genre];
  return `${capitalize(pick(g.leads))} ${pick(g.plots)} in ${pick(g.places)}. ${pick(g.hooks)}`;
}

function buildCatalog() {
  const usedTitles = new Set(FEATURED.map((movie) => movie.title));
  const remaining = {};
  for (const [genre, def] of Object.entries(GENRES)) remaining[genre] = def.count;
  for (const movie of FEATURED) remaining[movie.genre] -= 1;

  const drafts = FEATURED.map((movie) => ({ ...movie }));

  // Interleave genres so IDs are not grouped by genre.
  const queue = [];
  for (const [genre, count] of Object.entries(remaining)) {
    for (let i = 0; i < count; i++) queue.push(genre);
  }
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  for (const genre of queue) {
    const def = GENRES[genre];
    let title;
    let attempts = 0;
    do {
      title = pick(def.titles)();
      attempts += 1;
      if (attempts > 200) throw new Error(`Could not generate a unique ${genre} title`);
    } while (usedTitles.has(title));
    usedTitles.add(title);

    drafts.push({
      title,
      genre,
      releaseYear: generateYear(),
      duration: between(def.duration[0], def.duration[1]),
      rating: generateRating(),
      description: generateDescription(genre),
    });
  }

  return drafts.map((draft, index) => {
    const id = `sbx-${String(index + 1).padStart(4, '0')}`;
    return {
      id,
      title: draft.title,
      description: draft.description,
      genre: draft.genre,
      releaseYear: draft.releaseYear,
      duration: draft.duration,
      rating: draft.rating,
      posterUrl: `/images/posters/${id}.svg`,
      backdropUrl: `/images/backdrops/${id}.svg`,
      videoUrl: VIDEOS[index % VIDEOS.length],
    };
  });
}

// ---------------------------------------------------------------------------
// Artwork generation (SVG)
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function motifShapes(motif, w, h, colors, r) {
  const [dark, mid, accent] = colors;
  const shapes = [];
  switch (motif) {
    case 'sun': {
      const cx = w * (0.3 + r() * 0.4);
      const cy = h * (0.28 + r() * 0.2);
      const radius = w * (0.18 + r() * 0.14);
      shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(radius * 1.6).toFixed(0)}" fill="${accent}" opacity="0.12"/>`);
      shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${radius.toFixed(0)}" fill="${accent}" opacity="0.85"/>`);
      const horizon = h * (0.5 + r() * 0.15);
      shapes.push(`<rect x="0" y="${horizon.toFixed(0)}" width="${w}" height="${(h - horizon).toFixed(0)}" fill="${dark}" opacity="0.75"/>`);
      break;
    }
    case 'mountains': {
      for (let layer = 0; layer < 3; layer++) {
        const base = h * (0.45 + layer * 0.12);
        const points = [`0,${h}`];
        const steps = 5 + Math.floor(r() * 4);
        for (let i = 0; i <= steps; i++) {
          const x = (w / steps) * i;
          const y = base - r() * h * 0.2;
          points.push(`${x.toFixed(0)},${y.toFixed(0)}`);
        }
        points.push(`${w},${h}`);
        const color = mix(mid, dark, 0.35 + layer * 0.25);
        shapes.push(`<polygon points="${points.join(' ')}" fill="${color}" opacity="0.9"/>`);
      }
      shapes.push(`<circle cx="${(w * (0.2 + r() * 0.6)).toFixed(0)}" cy="${(h * 0.22).toFixed(0)}" r="${(w * 0.08).toFixed(0)}" fill="${accent}" opacity="0.7"/>`);
      break;
    }
    case 'rings': {
      const cx = w * (0.35 + r() * 0.3);
      const cy = h * (0.3 + r() * 0.2);
      for (let i = 6; i >= 1; i--) {
        shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${((w / 10) * i).toFixed(0)}" fill="none" stroke="${accent}" stroke-width="${(w / 90).toFixed(1)}" opacity="${(0.12 + (6 - i) * 0.1).toFixed(2)}"/>`);
      }
      shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(w / 14).toFixed(0)}" fill="${accent}" opacity="0.9"/>`);
      break;
    }
    case 'stripes': {
      const count = 5 + Math.floor(r() * 4);
      for (let i = 0; i < count; i++) {
        const x = (w / count) * i - w * 0.2;
        shapes.push(`<rect x="${x.toFixed(0)}" y="${-h * 0.2}" width="${(w / count / 2.2).toFixed(0)}" height="${h * 1.4}" fill="${i % 2 ? accent : mid}" opacity="${(0.08 + r() * 0.18).toFixed(2)}" transform="rotate(${(18 + r() * 14).toFixed(0)} ${w / 2} ${h / 2})"/>`);
      }
      shapes.push(`<circle cx="${(w * 0.7).toFixed(0)}" cy="${(h * 0.32).toFixed(0)}" r="${(w * 0.16).toFixed(0)}" fill="${accent}" opacity="0.55"/>`);
      break;
    }
    case 'skyline': {
      let x = 0;
      while (x < w) {
        const bw = w * (0.05 + r() * 0.09);
        const bh = h * (0.18 + r() * 0.35);
        shapes.push(`<rect x="${x.toFixed(0)}" y="${(h * 0.72 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${(bh + h * 0.3).toFixed(0)}" fill="${mix(dark, mid, r() * 0.4)}"/>`);
        x += bw + w * 0.008;
      }
      shapes.push(`<circle cx="${(w * (0.25 + r() * 0.5)).toFixed(0)}" cy="${(h * 0.24).toFixed(0)}" r="${(w * 0.11).toFixed(0)}" fill="${accent}" opacity="0.75"/>`);
      break;
    }
    case 'grid':
    default: {
      const cols = 6;
      for (let i = 0; i <= cols; i++) {
        const x = (w / cols) * i;
        shapes.push(`<line x1="${x.toFixed(0)}" y1="${(h * 0.55).toFixed(0)}" x2="${(w / 2 + (x - w / 2) * 3).toFixed(0)}" y2="${h}" stroke="${accent}" stroke-width="${(w / 220).toFixed(1)}" opacity="0.35"/>`);
      }
      for (let i = 0; i < 6; i++) {
        const y = h * 0.55 + Math.pow(i / 6, 1.8) * h * 0.45;
        shapes.push(`<line x1="0" y1="${y.toFixed(0)}" x2="${w}" y2="${y.toFixed(0)}" stroke="${accent}" stroke-width="${(w / 260).toFixed(1)}" opacity="0.3"/>`);
      }
      shapes.push(`<circle cx="${(w / 2).toFixed(0)}" cy="${(h * 0.45).toFixed(0)}" r="${(w * 0.15).toFixed(0)}" fill="${accent}" opacity="0.6"/>`);
      break;
    }
  }
  return shapes.join('');
}

function wrapTitle(title, maxChars) {
  const words = title.toUpperCase().split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function artworkColors(movie, r) {
  const [dark, mid, accent] = GENRES[movie.genre].palette;
  return [mix(dark, '#000000', r() * 0.3), mix(mid, accent, r() * 0.35), mix(accent, '#ffffff', r() * 0.2)];
}

function posterSvg(movie) {
  const r = mulberry32(parseInt(movie.id.slice(4), 10) * 7919 + 1);
  const w = 300;
  const h = 450;
  const colors = artworkColors(movie, r);
  const motifs = GENRES[movie.genre].motifs;
  const motif = motifs[Math.floor(r() * motifs.length)];
  const lines = wrapTitle(movie.title, 13);
  const longest = Math.max(...lines.map((line) => line.length));
  const fontSize = Math.min(44, Math.floor(262 / (longest * 0.64)));
  const lineHeight = fontSize * 1.08;
  const textTop = h - 34 - (lines.length - 1) * lineHeight;
  const text = lines
    .map((line, i) => `<text x="${w / 2}" y="${(textTop + i * lineHeight).toFixed(0)}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="1" fill="#ffffff">${escapeXml(line)}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="${(r() * 0.6).toFixed(2)}" y2="1"><stop offset="0" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[0]}"/></linearGradient>` +
    `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#bg)"/>` +
    motifShapes(motif, w, h, colors, r) +
    `<rect width="${w}" height="${h}" fill="url(#fade)"/>` +
    `<text x="${w / 2}" y="34" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="4" fill="#ffffff" opacity="0.75">STREAMBOX</text>` +
    text +
    `</svg>\n`;
}

function backdropSvg(movie) {
  const r = mulberry32(parseInt(movie.id.slice(4), 10) * 104729 + 3);
  const w = 1920;
  const h = 1080;
  const colors = artworkColors(movie, r);
  const motifs = GENRES[movie.genre].motifs;
  const motif = motifs[Math.floor(r() * motifs.length)];
  // Keep the artwork's focal point on the right, away from the title and description.
  const motifWidth = Math.round(w * 0.62);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="${(0.4 + r() * 0.6).toFixed(2)}"><stop offset="0" stop-color="${colors[0]}"/><stop offset="0.55" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[0]}"/></linearGradient>` +
    `<radialGradient id="glow" cx="${(0.55 + r() * 0.3).toFixed(2)}" cy="0.35" r="0.6"><stop offset="0" stop-color="${colors[2]}" stop-opacity="0.35"/><stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#bg)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>` +
    `<g transform="translate(${w - motifWidth} 0)">${motifShapes(motif, motifWidth, h, colors, r)}</g>` +
    `</svg>\n`;
}

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

const movies = buildCatalog();

const postersDir = join(ROOT, 'public/images/posters');
const backdropsDir = join(ROOT, 'public/images/backdrops');
rmSync(postersDir, { recursive: true, force: true });
rmSync(backdropsDir, { recursive: true, force: true });
mkdirSync(postersDir, { recursive: true });
mkdirSync(backdropsDir, { recursive: true });
mkdirSync(join(ROOT, 'src/data'), { recursive: true });

for (const movie of movies) {
  writeFileSync(join(postersDir, `${movie.id}.svg`), posterSvg(movie));
  writeFileSync(join(backdropsDir, `${movie.id}.svg`), backdropSvg(movie));
}

writeFileSync(join(ROOT, 'src/data/movies.json'), `${JSON.stringify(movies, null, 2)}\n`);

const counts = {};
for (const movie of movies) counts[movie.genre] = (counts[movie.genre] || 0) + 1;
console.log(`Generated ${movies.length} movies`);
console.table(counts);
