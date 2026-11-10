// Home positions and the running example's text, shared across scenes.
// Lesson 3's flow-sensor order continues: the viewer asks the AI to place the order (500 units by June).
// Supplier names, amounts, lead times and PO references are invented and illustrative; the policy's 30-day
// lead-time limit is §4.2 of lesson 3's supplier-policy-2025.pdf.

// Layout rules for every scene (see BLUEPRINT.md, "Layout rules"):
// - compositions are symmetric about screen centre (x = 960);
// - the content band runs from y = 180 to y = 880;
// - each scene's takeaway caption sits at CAPTION_Y, the same place every time;
// - areas in a row are spaced with ROW_GAP.
export const CX = 960;
export const CAPTION_Y = 950;
export const ROW_GAP = 100;

export const REQUEST = 'Order 500 flow sensors by June.';
export const DESCRIPTION = "I'd order 500 from Northfield Sensors on the purchasing portal.";
export const GOAL = 'Order sensors within policy';
export const PORTAL_NAME = 'PURCHASING PORTAL';
export const PORTAL_ROW = '500 flow sensors · by June';
export const ORDER_REF = 'PO-20417';
export const ORDER_PRICE = 'Place order? £9,750';

// The four tools the agent can use.
export const TOOL_NAMES = ['read_policy', 'search_suppliers', 'check_stock', 'place_order'] as const;

export const SEARCH = {
  name: 'search_suppliers',
  inputs: ['part: flow sensor', 'qty: 500'],
  results: ['Northfield · 25 days', 'Apex · 40 days'],
};
export const STOCK = {name: 'check_stock'};
export const ORDER = {name: 'place_order'};

// The wall (Scenes 2 and 3): the model's side on the left, the world on the right, the app's gate between.
// The cube and the docks sit the same distance either side of the wall.
export const WALL = {x: CX, top: 200, bottom: 880};
export const GATE = {x: CX, y: 560, w: 260, h: 340};
export const MODEL_CUBE = {x: 360, y: 560, size: 70};
export const TOOL_LIST = {x: 360, y: 285, w: 340};
export const TICKET_AT = {x: 645, y: 560, w: 320}; // wide enough for search_suppliers at 28 px
// Wide enough for PURCHASING PORTAL at 26 px. The docks' outer edge mirrors the tool list's (x = 190 / 1730),
// so the model side and the world side balance about the wall.
export const DOCK_W = 460;
const DOCK_X = 2 * CX - (TOOL_LIST.x - TOOL_LIST.w / 2) - DOCK_W / 2;
export const DOCKS = {
  file: {x: DOCK_X, y: 400, name: 'READ FILE', icon: 'file'},
  search: {x: DOCK_X, y: 560, name: 'SUPPLIER SEARCH', icon: 'search'},
  portal: {x: DOCK_X, y: 720, name: PORTAL_NAME, icon: 'portal'},
} as const;

// Scene 4's loop, centred on screen.
export const RING = {x: CX, y: 570, r: 270};
