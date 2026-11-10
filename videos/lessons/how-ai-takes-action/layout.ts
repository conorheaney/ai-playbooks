// Home positions and the running example's text, shared across scenes.
// The Canberra trip continues: the viewer asks the AI to book the hotel. Amounts, hotel names, section numbers
// and booking references are illustrative.

// Layout rules for every scene (see BLUEPRINT.md, "Layout rules"):
// - compositions are symmetric about screen centre (x = 960);
// - the content band runs from y = 180 to y = 880;
// - each scene's takeaway caption sits at CAPTION_Y, the same place every time;
// - areas in a row are spaced with ROW_GAP.
export const CX = 960;
export const CAPTION_Y = 950;
export const ROW_GAP = 100;

export const REQUEST = 'Book my hotel for the Canberra trip.';
export const DESCRIPTION = "I'd book Parkside Hotel for 12–17 March on the travel portal.";
export const GOAL = 'Book a hotel within policy';
export const PORTAL_ROW = 'Parkside Hotel · 12–17 Mar';
export const BOOKING_REF = 'ref PK-0412';

// The four tools the agent can use.
export const TOOL_NAMES = ['read_policy', 'search_hotels', 'check_availability', 'book_hotel'] as const;

export const SEARCH = {
  name: 'search_hotels',
  inputs: ['city: Canberra', 'dates: 12–17 Mar'],
  results: ['Parkside · $235', 'Capital Tower · $289'],
};
export const AVAILABILITY = {name: 'check_availability'};
export const BOOKING = {name: 'book_hotel'};

// The wall (Scenes 2 and 3): the model's side on the left, the world on the right, the app's gate between.
// The cube and the docks sit the same distance either side of the wall.
export const WALL = {x: CX, top: 200, bottom: 880};
export const GATE = {x: CX, y: 560, w: 260, h: 340};
export const MODEL_CUBE = {x: 360, y: 560, size: 70};
export const TOOL_LIST = {x: 360, y: 285, w: 340};
export const TICKET_AT = {x: 645, y: 560, w: 280};
export const DOCK_W = 380;
const DOCK_X = 2 * CX - MODEL_CUBE.x; // mirrors the cube
export const DOCKS = {
  file: {x: DOCK_X, y: 400, name: 'READ FILE', icon: 'file'},
  search: {x: DOCK_X, y: 560, name: 'HOTEL SEARCH', icon: 'search'},
  portal: {x: DOCK_X, y: 720, name: 'TRAVEL PORTAL', icon: 'portal'},
} as const;

// Scene 4's loop, centred on screen.
export const RING = {x: CX, y: 570, r: 270};
