// Complete 220 Panna reference data (Single / Double / Triple Panna)
// Grouped by Ank (0-9). Ank = (d1 + d2 + d3) % 10
// Each ank has exactly 22 pannas: 12 Single + 9 Double + 1 Triple

export const PANNA_22_CHART = [
  {
    ank: 1,
    triple: "777",
    singlePannas: ["128", "137", "146", "236", "245", "290", "380", "470", "489", "560", "678", "579"],
    doublePannas: ["100", "119", "155", "227", "335", "344", "399", "588", "669"],
  },
  {
    ank: 2,
    triple: "444",
    singlePannas: ["129", "138", "147", "156", "237", "246", "345", "390", "480", "570", "679", "589"],
    doublePannas: ["200", "110", "228", "255", "336", "499", "660", "688", "778"],
  },
  {
    ank: 3,
    triple: "111",
    singlePannas: ["120", "139", "148", "157", "238", "247", "256", "346", "490", "580", "670", "689"],
    doublePannas: ["300", "166", "229", "337", "355", "445", "599", "779", "788"],
  },
  {
    ank: 4,
    triple: "888",
    singlePannas: ["130", "149", "158", "167", "239", "248", "257", "347", "356", "590", "680", "789"],
    doublePannas: ["400", "112", "220", "266", "338", "446", "455", "699", "770"],
  },
  {
    ank: 5,
    triple: "555",
    singlePannas: ["140", "159", "168", "230", "249", "258", "267", "348", "357", "456", "690", "780"],
    doublePannas: ["500", "113", "122", "177", "339", "366", "447", "799", "889"],
  },
  {
    ank: 6,
    triple: "222",
    singlePannas: ["123", "150", "169", "178", "240", "259", "268", "349", "358", "457", "367", "790"],
    doublePannas: ["600", "114", "277", "330", "448", "466", "556", "880", "899"],
  },
  {
    ank: 7,
    triple: "999",
    singlePannas: ["124", "160", "179", "250", "269", "278", "340", "359", "368", "458", "467", "890"],
    doublePannas: ["700", "115", "133", "188", "223", "377", "449", "557", "566"],
  },
  {
    ank: 8,
    triple: "666",
    singlePannas: ["125", "134", "170", "189", "260", "279", "350", "369", "378", "459", "567", "468"],
    doublePannas: ["800", "116", "224", "233", "288", "440", "477", "558", "990"],
  },
  {
    ank: 9,
    triple: "333",
    singlePannas: ["126", "135", "180", "234", "270", "289", "360", "379", "450", "469", "478", "568"],
    doublePannas: ["900", "117", "144", "199", "225", "388", "559", "577", "667"],
  },
  {
    ank: 0,
    triple: "000",
    singlePannas: ["127", "136", "145", "190", "235", "280", "370", "389", "460", "479", "569", "578"],
    doublePannas: ["118", "226", "244", "299", "334", "488", "550", "668", "677"],
  },
];

// Flat lists (ank order 0-9 for clean display)
const byAnk = [...PANNA_22_CHART].sort((a, b) => a.ank - b.ank);

export const SINGLE_PANNA_LIST = byAnk.flatMap((g) => g.singlePannas);
export const DOUBLE_PANNA_LIST = byAnk.flatMap((g) => g.doublePannas);
export const TRIPLE_PANNA_LIST = byAnk.map((g) => g.triple);

// Ank of a 3-digit panna = sum of digits % 10
export const getAnk = (panna = "") => {
  const digits = String(panna).replace(/\D/g, "");
  if (digits.length !== 3) return null;
  const sum = digits.split("").reduce((acc, d) => acc + Number(d), 0);
  return sum % 10;
};

// SP = all 3 digits different, DP = exactly 2 same, TP = all 3 same
export const getPannaType = (panna = "") => {
  const digits = String(panna).replace(/\D/g, "");
  if (digits.length !== 3) return null;
  const [a, b, c] = digits.split("");
  if (a === b && b === c) return "TP";
  if (a === b || b === c || a === c) return "DP";
  return "SP";
};

export const PANNA_TYPE_LABEL = {
  SP: "Single Panna",
  DP: "Double Panna",
  TP: "Triple Panna",
};
