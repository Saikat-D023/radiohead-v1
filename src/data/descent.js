// The dive, shared by the ocean page and the album pages. Each album is found
// inside a piece of junk drifting at its depth (`find`); `dim` is how much light
// still reaches it, `mouth` where the record comes out (fractions of the image);
// `seam` and `bands` are where the picture is cut into pieces that move on their own

export const MAX_DEPTH = 10935; // Challenger Deep

export const ZONES = [
    {
        id: 'sunlight', name: 'Sunlight Zone', range: [0, 200], colors: ['#3a8fa3', '#1d6680'], glow: null,
        era: 'Era 01 · 1993 – 1995', title: 'The Alternative Rock Era',
        text: "In the shallows the light still reaches everything. Radiohead arrive as a post-grunge British guitar band: three guitars, bass and drums, the distorted angst of 'Creep', then the expansive anthems of The Bends. Familiar shapes, bright colours, but the existential undertow is already there.",
        albums: [
            {
                id: 1, title: 'Pablo Honey', year: '1993', image: '/pablo honey.png', depth: 40, track: 'Creep', wikiTitle: 'Pablo_Honey',
                find: { name: 'Yellow flower', src: '/finds/flower.webp', kind: 'bloom', mouth: [0.5, 0.48], front: true, width: 300, dim: 1 },
                tracks: ['You', 'Creep', 'How Do You?', 'Stop Whispering', 'Thinking About You', 'Anyone Can Play Guitar', 'Ripcord', 'Vegetable', 'Prove Yourself', "I Can't", 'Lurgee', 'Blow Out'],
            },
            {
                id: 2, title: 'The Bends', year: '1995', image: '/the bends.png', depth: 150, track: 'Fake Plastic Trees', wikiTitle: 'The_Bends',
                find: { name: 'Resuscitation mannequin', src: '/finds/mannequin.webp', kind: 'tilt', mouth: [0.66, 0.88], width: 330, dim: 1 },
                tracks: ['Planet Telex', 'The Bends', 'High and Dry', 'Fake Plastic Trees', 'Bones', '(Nice Dream)', 'Just', 'My Iron Lung', 'Bullet Proof..I Wish I Was', 'Black Star', 'Sulk', 'Street Spirit (Fade Out)'],
            },
        ],
    },
    {
        id: 'twilight', name: 'Twilight Zone', range: [200, 1000], colors: ['#1d6680', '#0c3550'], glow: '95,179,214',
        era: 'Era 02 · 1997', title: 'The Turn',
        text: "The light starts to fail. OK Computer keeps the guitars but bends them into progressive, orchestrated structures, and the songs turn toward alienation, technology and modern life. It is the last record you can still see the surface from.",
        albums: [
            {
                id: 3, title: 'OK Computer', year: '1997', image: '/ok computer.png', depth: 650, track: 'Paranoid Android', wikiTitle: 'OK_Computer',
                find: { name: 'Abandoned CRT monitor', src: '/finds/crt.webp', kind: 'screen', screen: [44, 12, 52, 68], mouth: [0.7, 0.45], front: true, width: 330, dim: 0.8 },
                tracks: ['Airbag', 'Paranoid Android', 'Subterranean Homesick Alien', 'Exit Music (For a Film)', 'Let Down', 'Karma Police', 'Fitter Happier', 'Electioneering', 'Climbing Up the Walls', 'No Surprises', 'Lucky', 'The Tourist'],
            },
        ],
    },
    {
        id: 'midnight', name: 'Midnight Zone', range: [1000, 4000], colors: ['#0c3550', '#04121f'], glow: '76,201,240',
        era: 'Era 03 · 2000 – 2003', title: 'The Electronic Evolution',
        text: "No sunlight reaches this far. Kid A and Amnesiac abandon conventional rock for electronic landscapes drawn from IDM, jazz and 20th-century classical music: synthesizers, drum machines, Ondes Martenot and heavy digital manipulation. Hail to the Thief drags the guitars back down into the dark with them.",
        albums: [
            {
                id: 4, title: 'Kid A', year: '2000', image: '/kid a.png', depth: 1400, track: 'Everything In Its Right Place', wikiTitle: 'Kid_A',
                find: { name: 'Iceberg fragment', src: '/finds/iceberg.webp', kind: 'split', seam: [[37, 0], [40, 24], [35, 46], [44, 68], [41, 100]], mouth: [0.4, 0.55], width: 330, dim: 0.62 },
                tracks: ['Everything in Its Right Place', 'Kid A', 'The National Anthem', 'How to Disappear Completely', 'Treefingers', 'Optimistic', 'In Limbo', 'Idioteque', 'Morning Bell', 'Motion Picture Soundtrack'],
            },
            {
                id: 5, title: 'Amnesiac', year: '2001', image: '/amnesiac.png', depth: 2300, track: 'Pyramid Song', wikiTitle: 'Amnesiac_(album)',
                find: { name: 'Rusted metal chest', src: '/finds/chest.webp', kind: 'lid', seam: [[0, 40], [8, 48], [60, 50], [100, 43]], mouth: [0.5, 0.47], width: 350, dim: 0.62 },
                tracks: ['Packt Like Sardines in a Crushd Tin Box', 'Pyramid Song', 'Pulk/Pull Revolving Doors', 'You and Whose Army?', 'I Might Be Wrong', 'Knives Out', 'Morning Bell/Amnesiac', 'Dollars and Cents', 'Hunting Bears', 'Like Spinning Plates', 'Life in a Glasshouse'],
            },
            {
                id: 6, title: 'Hail to the Thief', year: '2003', image: '/hail to the theif.png', depth: 3400, track: 'There There', wikiTitle: 'Hail_to_the_Thief',
                find: { name: 'Political street sign', src: '/finds/sign.webp', kind: 'peel', bands: [36, 62], mouth: [0.5, 0.5], width: 350, dim: 0.62 },
                tracks: ['2 + 2 = 5', 'Sit Down. Stand Up.', 'Sail to the Moon', 'Backdrifts', 'Go to Sleep', 'Where I End and You Begin', 'We Suck Young Blood', 'The Gloaming', 'There There', 'I Will', 'A Punchup at a Wedding', 'Myxomatosis', 'Scatterbrain', 'A Wolf at the Door'],
            },
        ],
    },
    {
        id: 'abyssal', name: 'Abyssal Zone', range: [4000, 6000], colors: ['#04121f', '#02070d'], glow: '123,92,255',
        era: 'Era 04 · 2007 – 2011', title: 'The Art Rock Synthesis',
        text: "Down here things make their own light. In Rainbows finds a warm synthesis of acoustic roots and electronic experiment, with complex polyrhythms and an organic use of effects. The King of Limbs goes further into loops and rhythm. In the deepest ocean, the bottom of the sea.",
        albums: [
            {
                id: 7, title: 'In Rainbows', year: '2007', image: '/in rainbows.png', depth: 4500, track: 'Weird Fishes/Arpeggi', soundtrack: 'weird-fishes', wikiTitle: 'In_Rainbows',
                find: { name: 'Coloured plastic sheet', src: '/finds/plastic.webp', kind: 'ripple', mouth: [0.5, 0.45], width: 380, dim: 0.5 },
                tracks: ['15 Step', 'Bodysnatchers', 'Nude', 'Weird Fishes/Arpeggi', 'All I Need', 'Faust Arp', 'Reckoner', 'House of Cards', 'Jigsaw Falling into Place', 'Videotape'],
            },
            {
                id: 8, title: 'The King of Limbs', year: '2011', image: '/the king of limbs.png', depth: 5600, track: 'Lotus Flower', wikiTitle: 'The_King_of_Limbs',
                find: { name: 'Dead tree roots', src: '/finds/roots.webp', kind: 'roots', mouth: [0.5, 0.75], width: 400, dim: 0.5 },
                tracks: ['Bloom', 'Morning Mr Magpie', 'Little by Little', 'Feral', 'Lotus Flower', 'Codex', 'Give Up the Ghost', 'Separator'],
            },
        ],
    },
    {
        id: 'hadal', name: 'Hadal Zone', range: [6000, MAX_DEPTH], colors: ['#02070d', '#000000'], glow: '159,230,255',
        era: 'Era 05 · 2016', title: 'The Deepest Point',
        text: "The trenches. A Moon Shaped Pool is the quietest and heaviest record of all: choral and string arrangements by Jonny Greenwood with the London Contemporary Orchestra, and songs that had waited decades to be recorded, like 'True Love Waits'.",
        albums: [
            {
                id: 9, title: 'A Moon Shaped Pool', year: '2016', image: '/moon Shaped Pool.png', depth: 8200, track: 'Daydreaming', wikiTitle: 'A_Moon_Shaped_Pool',
                find: { name: 'Open wedding ring box', src: '/finds/ring-box.webp', kind: 'hinge', seam: [[0, 48], [30, 50], [75, 48], [100, 50]], glint: [60, 62], mouth: [0.45, 0.62], front: true, width: 240, dim: 0.45 },
                tracks: ['Burn the Witch', 'Daydreaming', 'Decks Dark', 'Desert Island Disk', 'Ful Stop', 'Glass Eyes', 'Identikit', 'The Numbers', 'Present Tense', 'Tinker Tailor Soldier Sailor Rich Man Poor Man Beggar Man Thief', 'True Love Waits'],
            },
        ],
    },
];

export const fmt = (m) => m.toLocaleString('en-GB');

// Finds an album and the zone it was found in
export function findAlbum(id) {
    for (const zone of ZONES) {
        const album = zone.albums.find((a) => a.id === id);
        if (album) return { album, zone };
    }
    return null;
}

// Where on screen you opened an album, so coming back puts its cover in the same
// spot again (even if the page above it has changed height in between)
const RETURN_KEY = 'descent-return';

export function rememberDive(albumId, el) {
    try {
        sessionStorage.setItem(RETURN_KEY, JSON.stringify({ albumId, top: el.getBoundingClientRect().top }));
    } catch { /* private mode: coming back starts at the surface */ }
}

export function readDive() {
    try {
        return JSON.parse(sessionStorage.getItem(RETURN_KEY));
    } catch {
        return null;
    }
}

export function forgetDive() {
    try {
        sessionStorage.removeItem(RETURN_KEY);
    } catch { /* nothing was saved */ }
}
