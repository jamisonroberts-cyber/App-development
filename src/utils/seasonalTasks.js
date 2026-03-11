// Seasonal beekeeping tasks for the Piedmont Triad, NC
// Priority: 'High' | 'Medium' | 'Low'

const ALL_TASKS = [
  // ---- WINTER (Dec, Jan, Feb) ----
  { id: 'w1', title: 'Heft hives to check winter food stores', priority: 'High', months: [12, 1, 2] },
  { id: 'w2', title: 'Apply emergency fondant or candy boards if needed', priority: 'High', months: [1, 2] },
  { id: 'w3', title: 'Check for mouse entry and seal gaps in bottom boards', priority: 'High', months: [12, 1] },
  { id: 'w4', title: 'Ensure hive entrance reducers are in place', priority: 'Medium', months: [12, 1, 2] },
  { id: 'w5', title: 'Inspect for winter cluster activity on warm days (>50°F)', priority: 'Medium', months: [1, 2] },
  { id: 'w6', title: 'Order package bees, nucs, or queens for spring', priority: 'High', months: [12, 1, 2] },
  { id: 'w7', title: 'Repair and clean equipment during downtime', priority: 'Low', months: [12, 1, 2] },
  { id: 'w8', title: 'Review last year\'s records and plan for the season ahead', priority: 'Low', months: [12, 1] },

  // ---- EARLY SPRING (Mar) ----
  { id: 'es1', title: 'Do first full inspection when temps stay above 55°F', priority: 'High', months: [3] },
  { id: 'es2', title: 'Verify queen is laying and brood pattern is solid', priority: 'High', months: [3] },
  { id: 'es3', title: 'Begin feeding 1:1 sugar syrup to stimulate brood rearing', priority: 'High', months: [3] },
  { id: 'es4', title: 'Add pollen substitute patties to boost early brood', priority: 'Medium', months: [3] },
  { id: 'es5', title: 'Remove entrance reducers as population grows', priority: 'Medium', months: [3] },
  { id: 'es6', title: 'Watch for and remove any starvation-risk hives', priority: 'High', months: [3] },

  // ---- SPRING (Apr, May) ----
  { id: 'sp1', title: 'Monitor for swarm cells weekly during peak swarm season', priority: 'High', months: [4, 5] },
  { id: 'sp2', title: 'Add honey supers before the Tulip Poplar and Black Locust flow', priority: 'High', months: [4] },
  { id: 'sp3', title: 'Perform splits to prevent swarming and build hive count', priority: 'High', months: [4, 5] },
  { id: 'sp4', title: 'Install package bees or nucs', priority: 'High', months: [4, 5] },
  { id: 'sp5', title: 'Treat for Varroa mites before main flow (oxalic acid dribble or strips)', priority: 'High', months: [4] },
  { id: 'sp6', title: 'Replace old dark comb to reduce disease reservoir', priority: 'Medium', months: [4, 5] },
  { id: 'sp7', title: 'Check and requeen failing or aggressive colonies', priority: 'Medium', months: [5] },

  // ---- SUMMER (Jun, Jul, Aug) ----
  { id: 'su1', title: 'Harvest spring honey (Tulip Poplar/Black Locust) off supers', priority: 'High', months: [6] },
  { id: 'su2', title: 'Ensure adequate ventilation — add shim or screened bottom boards', priority: 'High', months: [6, 7, 8] },
  { id: 'su3', title: 'Conduct Varroa mite wash — treat if >3% infestation rate', priority: 'High', months: [7, 8] },
  { id: 'su4', title: 'Provide fresh water source near apiary', priority: 'Medium', months: [6, 7, 8] },
  { id: 'su5', title: 'Watch for summer dearth — reduce entrance to limit robbing', priority: 'Medium', months: [7, 8] },
  { id: 'su6', title: 'Begin Varroa treatment (mite strips) before brood rearing peaks', priority: 'High', months: [8] },
  { id: 'su7', title: 'Harvest Sourwood honey if applicable (late June–August)', priority: 'Medium', months: [7, 8] },

  // ---- FALL (Sep, Oct, Nov) ----
  { id: 'f1', title: 'Complete Varroa treatment and confirm effectiveness', priority: 'High', months: [9] },
  { id: 'f2', title: 'Harvest summer/fall honey and remove supers before Oct', priority: 'High', months: [9, 10] },
  { id: 'f3', title: 'Feed 2:1 sugar syrup to build winter stores', priority: 'High', months: [9, 10] },
  { id: 'f4', title: 'Verify colonies have 60–80 lbs of honey stores for winter', priority: 'High', months: [10] },
  { id: 'f5', title: 'Requeen any failing colonies before brood rearing stops', priority: 'High', months: [9] },
  { id: 'f6', title: 'Install mouse guards on all hives', priority: 'Medium', months: [10, 11] },
  { id: 'f7', title: 'Reduce hive entrances for fall/winter', priority: 'Medium', months: [10, 11] },
  { id: 'f8', title: 'Consider oxalic acid vapor treatment during broodless period', priority: 'High', months: [11] },
  { id: 'f9', title: 'Wrap or insulate hives if needed for cold snaps', priority: 'Low', months: [11] },
  { id: 'f10', title: 'Clean and store extracted equipment', priority: 'Low', months: [10, 11] },
];

export function getTasksForMonth(month) {
  return ALL_TASKS.filter(t => t.months.includes(month));
}

export const PRIORITY_COLORS = {
  High: '#C0392B',
  Medium: '#E67E22',
  Low: '#5B8A3C',
};
