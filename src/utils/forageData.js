/**
 * Forage / Bloom Calendar for Randolph County, NC (Piedmont Region, Zone 7b)
 * Data based on local flora known to occur in/near Randolph County.
 */

// Source types
export const SOURCE_NECTAR = 'nectar';
export const SOURCE_POLLEN = 'pollen';
export const SOURCE_BOTH = 'both';

// Importance levels
export const IMPORTANCE_MAJOR = 'major';
export const IMPORTANCE_MODERATE = 'moderate';
export const IMPORTANCE_MINOR = 'minor';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Each entry: { name, months[], source, importance, color, notes }
 * months = 0-based month indices
 */
export const FORAGE_PLANTS = [
  // ─── JANUARY ───
  {
    name: 'Henbit',
    months: [0, 1, 2],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MINOR,
    color: '#9C27B0',
    notes: 'Cool-season weed; provides early pollen on warm days above 50°F.',
  },
  {
    name: 'Chickweed',
    months: [0, 1, 2],
    source: SOURCE_POLLEN,
    importance: IMPORTANCE_MINOR,
    color: '#E0E0E0',
    notes: 'Common winter weed; small pollen source on mild days.',
  },

  // ─── FEBRUARY / EARLY MARCH ───
  {
    name: 'Red Maple',
    months: [1, 2],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#F44336',
    notes: 'First major spring source in NC Piedmont. Critical early pollen & nectar when colonies are brood-rearing rapidly. Watch for frost on late-blooming trees.',
  },
  {
    name: 'Silver Maple',
    months: [1],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#EF9A9A',
    notes: 'Blooms slightly earlier than red maple; good pollen source.',
  },
  {
    name: 'American Elm',
    months: [1, 2],
    source: SOURCE_POLLEN,
    importance: IMPORTANCE_MODERATE,
    color: '#A5D6A7',
    notes: 'One of the earliest pollen sources. Helps stimulate early brood rearing.',
  },

  // ─── MARCH ───
  {
    name: 'Dandelion',
    months: [2, 3, 4, 8, 9],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#FFEB3B',
    notes: 'Excellent and abundant nectar & pollen. Spring dandelion bloom often triggers first strong buildup. Also resurges briefly in fall.',
  },
  {
    name: 'Redbud',
    months: [2, 3],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#CE93D8',
    notes: 'Common native tree; good early nectar source before leaves emerge.',
  },
  {
    name: 'Wild Cherry',
    months: [2, 3],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FFCDD2',
    notes: 'Abundant in NC woodlands; good nectar flow for a week or two.',
  },
  {
    name: 'Willow',
    months: [2, 3],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#C8E6C9',
    notes: 'Excellent early spring pollen. Bees will work willows heavily on warm March days.',
  },
  {
    name: 'Fruit Trees (Apple, Pear, Plum)',
    months: [2, 3],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FFCCBC',
    notes: 'Short but productive bloom. Good nectar; often coincides with first warm spring weather.',
  },
  {
    name: 'Blueberry',
    months: [2, 3],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#BBDEFB',
    notes: 'Native and cultivated; important early nectar source. Bumblebees and honeybees compete for blossoms.',
  },

  // ─── APRIL ───
  {
    name: 'Black Locust',
    months: [3, 4],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MAJOR,
    color: '#DCEDC8',
    notes: 'One of the best honey plants in the eastern US. Produces light, almost white honey with delicate floral flavor. Short but intense bloom — add supers before peak!',
  },
  {
    name: 'Tulip Poplar',
    months: [3, 4, 5],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#FFF176',
    notes: 'THE major spring honey plant for NC. Produces large amounts of dark, rich honey. Peak bloom in late April – mid May. This is the main spring honey flow for Randolph County.',
  },
  {
    name: 'Blackberry / Dewberry',
    months: [3, 4, 5],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#7B1FA2',
    notes: 'Extremely common in NC fence rows and open areas. Produces abundant nectar and pollen. Overlaps with tulip poplar for a strong spring flow.',
  },
  {
    name: 'Holly (American & Yaupon)',
    months: [3, 4],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MODERATE,
    color: '#2E7D32',
    notes: 'Common native shrub/tree. Nectar is worked heavily by honeybees.',
  },
  {
    name: 'Hawthorn',
    months: [3, 4],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MINOR,
    color: '#EF9A9A',
    notes: 'Scattered in woodlands; contributes to spring flow.',
  },
  {
    name: 'Vetch (Hairy & Crown)',
    months: [3, 4, 5, 6],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#E040FB',
    notes: 'Common roadside plant; good continuous nectar source through spring and early summer.',
  },

  // ─── MAY / JUNE ───
  {
    name: 'White Clover',
    months: [4, 5, 6, 7, 8],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#FAFAFA',
    notes: 'The classic bee pasture plant. Produces excellent light honey. Needs mowing management — flowers best before mowing. Very important throughout summer.',
  },
  {
    name: 'Red Clover',
    months: [4, 5, 6],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#F48FB1',
    notes: 'Deeper flower tube limits honeybee access slightly, but still worked. Pollen is especially valuable.',
  },
  {
    name: 'Crimson Clover',
    months: [3, 4, 5],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#E53935',
    notes: 'Common cover crop in NC. Short season but can be a local bonanza if planted nearby.',
  },
  {
    name: 'Multiflora Rose',
    months: [4, 5],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FCE4EC',
    notes: 'Invasive but a significant nectar source. Common along fence rows and woodland edges in Randolph County.',
  },
  {
    name: 'Privet',
    months: [4, 5],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MODERATE,
    color: '#F5F5F5',
    notes: 'Invasive shrub but bees work the flowers heavily for nectar.',
  },
  {
    name: 'Linden / Basswood',
    months: [5, 6],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MAJOR,
    color: '#FFF9C4',
    notes: 'Produces some of the finest honey in the eastern US. Bloom is intense but brief (1–2 weeks). Look for linden in older neighborhoods and parks.',
  },
  {
    name: 'Mimosa / Silk Tree',
    months: [5, 6, 7],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MODERATE,
    color: '#F8BBD9',
    notes: 'Invasive but bees love the fluffy pink blooms. Long bloom period through summer.',
  },
  {
    name: 'Sumac (Winged & Staghorn)',
    months: [5, 6, 7],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FF8F00',
    notes: 'Common native shrub. Provides both nectar and pollen during early summer dearth.',
  },
  {
    name: 'Honeysuckle (Japanese)',
    months: [4, 5, 6],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MODERATE,
    color: '#FFF9C4',
    notes: 'Invasive but heavily worked by bees. Common in Randolph County roadsides and thickets.',
  },

  // ─── JULY ─── SOURWOOD is the crown jewel
  {
    name: 'Sourwood',
    months: [6, 7],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MAJOR,
    color: '#FF7043',
    notes: 'NC\'s most prized honey plant! Sourwood honey is world-famous for its unique anise-like flavor. Blooms in July–early August in the NC Piedmont/foothills. Add supers early — flow can be intense.',
  },
  {
    name: 'Goldenrod (Early)',
    months: [6, 7],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FDD835',
    notes: 'Several goldenrod species begin blooming in mid-summer before the main fall flush.',
  },
  {
    name: 'Sweet Clover (White & Yellow)',
    months: [5, 6, 7],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FFFDE7',
    notes: 'Tall biennial; produces abundant nectar. Found along roadsides and disturbed areas.',
  },
  {
    name: 'Buttonbush',
    months: [6, 7, 8],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MINOR,
    color: '#E0F2F1',
    notes: 'Native shrub found near wetlands and streams. Interesting pollen source during summer.',
  },
  {
    name: 'Milkweed (Common & Butterfly)',
    months: [5, 6, 7],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#CE93D8',
    notes: 'Native perennial; fragrant flowers produce ample nectar. Also important for pollinators.',
  },

  // ─── AUGUST / SEPTEMBER (Fall Flow) ───
  {
    name: 'Goldenrod',
    months: [7, 8, 9],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#F9A825',
    notes: 'THE major fall forage crop. Several Solidago species bloom from August through October in Randolph County. Provides the critical fall stores colonies need for winter survival.',
  },
  {
    name: 'Aster',
    months: [7, 8, 9, 10],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MAJOR,
    color: '#B39DDB',
    notes: 'Multiple aster species bloom alongside goldenrod in the fall. Together they make up the fall nectar flow that colonies depend on for winter stores.',
  },
  {
    name: 'Japanese Knotweed',
    months: [7, 8, 9],
    source: SOURCE_NECTAR,
    importance: IMPORTANCE_MODERATE,
    color: '#FFCCBC',
    notes: 'Invasive but an important late-season nectar source. Bees work it heavily in late summer.',
  },
  {
    name: 'Ironweed',
    months: [7, 8, 9],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MINOR,
    color: '#7B1FA2',
    notes: 'Tall native perennial with vivid purple flowers. Good late-summer pollen source.',
  },
  {
    name: 'Spanish Needles / Bidens',
    months: [8, 9, 10],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MODERATE,
    color: '#FFF9C4',
    notes: 'Extremely productive late-season source. Bees will work it heavily in September and October.',
  },
  {
    name: 'Smartweed',
    months: [7, 8, 9],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MINOR,
    color: '#F8BBD9',
    notes: 'Common in damp disturbed areas; contributes to fall flow.',
  },

  // ─── OCTOBER / NOVEMBER ───
  {
    name: 'Witch Hazel',
    months: [9, 10, 11],
    source: SOURCE_POLLEN,
    importance: IMPORTANCE_MINOR,
    color: '#FFF9C4',
    notes: 'One of the last plants to bloom. Provides late-fall pollen on warm days when little else is available.',
  },
  {
    name: 'Chicory',
    months: [5, 6, 7, 8, 9],
    source: SOURCE_BOTH,
    importance: IMPORTANCE_MINOR,
    color: '#90CAF9',
    notes: 'Roadside perennial with blue flowers. Long bloom period; modest but consistent nectar source.',
  },
];

/**
 * Get plants blooming in a given month (0-based)
 */
export function getPlantsForMonth(monthIndex) {
  return FORAGE_PLANTS.filter(p => p.months.includes(monthIndex))
    .sort((a, b) => {
      const order = { major: 0, moderate: 1, minor: 2 };
      return order[a.importance] - order[b.importance];
    });
}

/**
 * Get a summary of how good a month is for forage
 */
export function getMonthForageScore(monthIndex) {
  const plants = getPlantsForMonth(monthIndex);
  let score = 0;
  plants.forEach(p => {
    if (p.importance === IMPORTANCE_MAJOR) score += 3;
    else if (p.importance === IMPORTANCE_MODERATE) score += 2;
    else score += 1;
  });
  return { plants, score };
}

export function getSourceLabel(source) {
  if (source === SOURCE_NECTAR) return 'Nectar';
  if (source === SOURCE_POLLEN) return 'Pollen';
  return 'Nectar & Pollen';
}

export function getImportanceLabel(importance) {
  if (importance === IMPORTANCE_MAJOR) return 'Major';
  if (importance === IMPORTANCE_MODERATE) return 'Moderate';
  return 'Minor';
}
