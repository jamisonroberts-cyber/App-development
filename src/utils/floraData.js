// Piedmont Triad, NC Honeybee Flora Calendar
// Bloom months: 1=Jan, 2=Feb, ... 12=Dec

export const FLORA_DATA = [
  {
    name: 'Red Maple',
    type: ['pollen', 'nectar'],
    bloomStart: 2,
    bloomEnd: 3,
    notes: 'One of the first spring sources. Critical for early colony buildup. Watch for late frosts that can kill blooms.',
  },
  {
    name: 'Henbit & Deadnettle',
    type: ['pollen', 'nectar'],
    bloomStart: 3,
    bloomEnd: 4,
    notes: 'Common lawn and field weeds providing important early spring forage. Leave unsprayed areas for best results.',
  },
  {
    name: 'Dandelion',
    type: ['pollen', 'nectar'],
    bloomStart: 3,
    bloomEnd: 5,
    notes: 'Excellent and abundant early season source. Highly attractive to bees. Avoid mowing before bloom finishes.',
  },
  {
    name: 'Red Bud',
    type: ['pollen'],
    bloomStart: 3,
    bloomEnd: 4,
    notes: 'Beautiful spring pollen source. Common ornamental and roadside tree throughout the Piedmont. Strong attractor.',
  },
  {
    name: 'Autumn Olive',
    type: ['nectar'],
    bloomStart: 4,
    bloomEnd: 5,
    notes: 'Highly fragrant blooms produce abundant nectar. Though invasive, it is a significant forage source in disturbed areas.',
  },
  {
    name: 'Persimmon',
    type: ['nectar'],
    bloomStart: 4,
    bloomEnd: 5,
    notes: 'Native persimmon provides good nectar flow. Common in woodland edges and old fields across the Piedmont.',
  },
  {
    name: 'Holly',
    type: ['nectar'],
    bloomStart: 4,
    bloomEnd: 5,
    notes: 'American and Yaupon holly are strong nectar sources. Common in the Piedmont as ornamentals and in woodland edges.',
  },
  {
    name: 'Black Locust',
    type: ['nectar'],
    bloomStart: 4,
    bloomEnd: 5,
    notes: 'Major nectar flow. One of the best honey plants in the Piedmont. Short bloom of 1–2 weeks — watch for peak timing.',
  },
  {
    name: 'Tulip Poplar',
    type: ['nectar'],
    bloomStart: 4,
    bloomEnd: 6,
    notes: 'The primary nectar flow for NC beekeepers. Produces large amounts of dark, robust honey. A cornerstone forage plant.',
  },
  {
    name: 'Blackberry & Brambles',
    type: ['pollen', 'nectar'],
    bloomStart: 5,
    bloomEnd: 6,
    notes: 'Excellent combined pollen and nectar source. Abundant along roadsides, field edges, and disturbed areas throughout the region.',
  },
  {
    name: 'White Clover',
    type: ['pollen', 'nectar'],
    bloomStart: 5,
    bloomEnd: 9,
    notes: 'The classic beekeeping plant. Long season, abundant nectar, and produces high-quality mild honey. Encourage in pastures and lawns.',
  },
  {
    name: 'Sumac',
    type: ['pollen', 'nectar'],
    bloomStart: 6,
    bloomEnd: 7,
    notes: 'Staghorn and smooth sumac both produce good summer forage. Very common along roadsides and old fields in the Piedmont.',
  },
  {
    name: 'Basswood (American Linden)',
    type: ['nectar'],
    bloomStart: 6,
    bloomEnd: 7,
    notes: 'Produces highly prized, delicate white honey. Short bloom window. Plant near apiaries for best results.',
  },
  {
    name: 'Vitex (Chaste Tree)',
    type: ['pollen', 'nectar'],
    bloomStart: 6,
    bloomEnd: 9,
    notes: 'Outstanding long-season ornamental forage. Bees work it heavily all day. Excellent choice for planting near hives.',
  },
  {
    name: 'Sourwood',
    type: ['nectar'],
    bloomStart: 6,
    bloomEnd: 8,
    notes: 'Produces NC\'s most prized honey — light, anise-flavored, highly sought after. Prevalent in Piedmont foothills. Major nectar flow.',
  },
  {
    name: 'Sunflower',
    type: ['pollen', 'nectar'],
    bloomStart: 7,
    bloomEnd: 9,
    notes: 'Both cultivated and wild sunflowers are excellent forage. Planted sunflower fields can trigger significant flows in late summer.',
  },
  {
    name: 'Japanese Knotweed',
    type: ['nectar'],
    bloomStart: 8,
    bloomEnd: 9,
    notes: 'Though invasive, it provides a significant late-summer nectar flow when little else is blooming. Important bridge to fall.',
  },
  {
    name: 'Liriope & Monkey Grass',
    type: ['nectar'],
    bloomStart: 8,
    bloomEnd: 9,
    notes: 'Very common ornamental in Piedmont landscapes. Bees work the tiny flowers intensely during late summer dearth periods.',
  },
  {
    name: 'Goldenrod',
    type: ['pollen', 'nectar'],
    bloomStart: 8,
    bloomEnd: 10,
    notes: 'Critical fall forage. Bees use it heavily for winter preparation — pollen protein stores and late honey production. Do not mow early.',
  },
  {
    name: 'Aster',
    type: ['pollen', 'nectar'],
    bloomStart: 9,
    bloomEnd: 10,
    notes: 'The last major fall forage. Combined with goldenrod, asters help bees build winter stores. Common in meadows and roadsides.',
  },
];

export function getPlantsForMonth(month) {
  return FLORA_DATA.filter(p => month >= p.bloomStart && month <= p.bloomEnd);
}

export const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_SHORT = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
