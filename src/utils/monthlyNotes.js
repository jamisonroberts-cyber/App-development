/**
 * Monthly beekeeping notes tailored for Randolph County, NC (Piedmont, Zone 7b)
 */

export const MONTHLY_NOTES = [
  {
    month: 'January',
    short: 'Minimal disturbance. Focus on planning.',
    tasks: [
      { priority: 'high', text: 'Heft hives to check winter stores — light hive = feed ASAP' },
      { priority: 'high', text: 'Clear dead bees from entrances after cold snaps' },
      { priority: 'high', text: 'Install mouse guards if not already done' },
      { priority: 'medium', text: 'Order packages, nucs, and queens for spring — supplies sell out!' },
      { priority: 'medium', text: 'Inspect and repair equipment during the off-season' },
      { priority: 'low', text: 'Attend local bee club meetings (Randolph Co. Beekeepers Association)' },
      { priority: 'low', text: 'Study: read bee books, watch educational videos' },
    ],
    forageTip: 'Almost no forage. Colonies are clustered and consuming winter stores. Do not open hives when temps are below 50°F.',
    warning: 'Colonies can starve in late winter (Jan–Feb). Check weight regularly. A full hive should weigh 60–80 lbs minimum.',
    temp: 'Do NOT open hives below 50°F. The cluster will break and bees can chill or be killed.',
  },
  {
    month: 'February',
    short: 'Red maple blooming — spring buildup begins!',
    tasks: [
      { priority: 'high', text: 'Watch for red maple bloom — colonies will begin rapid buildup' },
      { priority: 'high', text: 'Check stores — winter starvation risk is highest in Feb' },
      { priority: 'high', text: 'Feed 1:1 syrup or fondant/candy board if stores are low' },
      { priority: 'medium', text: 'On warm days (60°F+), do a quick peek — look for eggs' },
      { priority: 'medium', text: 'Prepare splits and new equipment for spring expansion' },
      { priority: 'low', text: 'Finalize spring package/nuc orders' },
    ],
    forageTip: 'Red maple is THE critical early source. Even light nectar triggers brood expansion. Bees flying on any day above 50°F.',
    warning: 'More colonies die from starvation in late winter than from cold. Check stores at least weekly.',
    temp: 'Inspect only on sunny, calm days above 55°F and only briefly.',
  },
  {
    month: 'March',
    short: 'Swarm season approaching — start inspections.',
    tasks: [
      { priority: 'high', text: 'Begin regular hive inspections on warm days (60°F+)' },
      { priority: 'high', text: 'Look for eggs, young larvae, and healthy brood pattern' },
      { priority: 'high', text: 'Check for and remove old/dark comb — replace with foundation' },
      { priority: 'high', text: 'Begin protein feeding (pollen substitute patties) to boost buildup' },
      { priority: 'medium', text: 'Reverse hive bodies if using traditional Langstroth management' },
      { priority: 'medium', text: 'Check for signs of disease: EFB, AFB (scale in cells)' },
      { priority: 'low', text: 'Prepare and clean supers for spring flow' },
    ],
    forageTip: 'Dandelions, wild cherry, willow, and redbud are in bloom. Colony population is expanding rapidly.',
    warning: 'Strong colonies may already be drawing swarm cells by late March. Inspect every 7–10 days.',
    temp: 'Full inspections safe on days 60°F+ with light wind and no rain.',
  },
  {
    month: 'April',
    short: 'Swarm season! Add supers now.',
    tasks: [
      { priority: 'high', text: 'SWARM PREVENTION: Inspect every 7–10 days — look for queen cells' },
      { priority: 'high', text: 'Add supers BEFORE colonies feel crowded (2/3 full = add super)' },
      { priority: 'high', text: 'Make splits from strong hives to prevent swarming' },
      { priority: 'high', text: 'Tulip poplar and black locust bloom imminent — be ready!' },
      { priority: 'medium', text: 'Check Varroa mite levels — treat if >2 mites/100 bees before flow' },
      { priority: 'medium', text: 'Requeen underperforming or queenless colonies' },
      { priority: 'low', text: 'Register your apiaries with NC Dept of Agriculture if not done' },
    ],
    forageTip: 'Blackberry, holly, vetch, fruit trees, and tulip poplar beginning. Major spring flow is imminent.',
    warning: 'April is peak swarm season in NC Piedmont. Missing swarm cells means losing half your bees. DO NOT skip inspections.',
    temp: 'Full inspections are ideal April–early June. Perfect beekeeping weather.',
  },
  {
    month: 'May',
    short: 'Peak spring honey flow — tulip poplar & black locust!',
    tasks: [
      { priority: 'high', text: 'Add supers generously — tulip poplar can fill boxes quickly' },
      { priority: 'high', text: 'Continue swarm prevention checks every 7–10 days' },
      { priority: 'medium', text: 'Monitor colony population — overcrowding triggers swarming' },
      { priority: 'medium', text: 'During heavy flow, bees can "honey bind" brood nest — check' },
      { priority: 'low', text: 'Install new packages/nucs if ordered' },
      { priority: 'low', text: 'Mark queens with current year color (2025 = blue)' },
    ],
    forageTip: 'PEAK FLOW. Tulip poplar and black locust are the dominant sources. White/red clover and blackberry supplement. Maximum nectar intake.',
    warning: 'During peak flow, bees sometimes fill supers so fast that frames are not fully capped. Wait for 80%+ capping before extracting.',
    temp: 'Ideal inspection weather. Inspect in the morning or evening to avoid disrupting forager flights.',
  },
  {
    month: 'June',
    short: 'Spring flow winding down — harvest and treat.',
    tasks: [
      { priority: 'high', text: 'Harvest spring honey (tulip poplar) once 80%+ frames are capped' },
      { priority: 'high', text: 'Perform Varroa mite wash/alcohol wash — treat if >2/100 bees' },
      { priority: 'high', text: 'Remove and extract honey supers before treating with MAQS or Apivar' },
      { priority: 'medium', text: 'Watch for robbing behavior as spring flow slows' },
      { priority: 'medium', text: 'Reduce entrances if robbing begins' },
      { priority: 'medium', text: 'Requeen colonies with poor temperament or low productivity' },
      { priority: 'low', text: 'Extract, filter, and bottle spring honey' },
    ],
    forageTip: 'Spring flow declining. Linden and clover bridge the gap. Summer dearth begins in late June — watch for robbing.',
    warning: 'Early summer dearth can stress colonies. Watch for increased defensive behavior and robbing. Keep entrances reduced.',
    temp: 'Inspections are still comfortable. Morning inspections best.',
  },
  {
    month: 'July',
    short: 'Sourwood flow! Summer dearth management.',
    tasks: [
      { priority: 'high', text: 'Add supers for sourwood flow if near foothills/woods' },
      { priority: 'high', text: 'Treat for Varroa mite if mite counts are high (OAV or MAQS)' },
      { priority: 'high', text: 'Ensure fresh water is available near apiaries' },
      { priority: 'medium', text: 'Monitor for queenlessness — colonies can fail quietly in summer' },
      { priority: 'medium', text: 'Watch for wax moth in weak colonies' },
      { priority: 'low', text: 'Harvest spring/early summer supers if not done' },
    ],
    forageTip: 'Sourwood is blooming! This is NC\'s prized specialty honey. Keep supers on. Summer dearth possible between flows — provide water.',
    warning: 'Heat and dearth stress colonies. High Varroa loads in summer = fall collapse. July mite treatment is critical.',
    temp: 'Inspect in early morning to avoid heat stress. Wear light clothing.',
  },
  {
    month: 'August',
    short: 'Fall buildup begins — critical Varroa management.',
    tasks: [
      { priority: 'high', text: 'VARROA TREATMENT is most critical now — treat before fall bees are raised' },
      { priority: 'high', text: 'Fall "winter bees" raised now must be healthy — high mites = weak winter cluster' },
      { priority: 'high', text: 'Harvest sourwood honey (early August before flow ends)' },
      { priority: 'high', text: 'Goldenrod beginning — add supers for fall flow' },
      { priority: 'medium', text: 'Feed light syrup only if stores are critically low' },
      { priority: 'low', text: 'Begin ordering winter supplies (entrance reducers, insulation)' },
    ],
    forageTip: 'Sourwood ending, goldenrod ramping up. Fall flow is beginning. The winter bees being raised NOW will carry the colony to spring.',
    warning: 'Treating for Varroa in August is the MOST IMPORTANT treatment of the year. High mites = dead colony by February.',
    temp: 'Still hot — inspect in early morning. Bees may be defensive during dearth periods.',
  },
  {
    month: 'September',
    short: 'Goldenrod & aster peak — prepare for winter.',
    tasks: [
      { priority: 'high', text: 'Ensure adequate winter stores — colonies need 60–80 lbs minimum' },
      { priority: 'high', text: 'Begin heavy fall feeding (2:1 syrup) if stores are short' },
      { priority: 'high', text: 'Final Varroa treatment if August treatment was delayed' },
      { priority: 'high', text: 'Reduce entrances with entrance reducers — yellow jackets are active' },
      { priority: 'medium', text: 'Remove queen excluders before winter' },
      { priority: 'medium', text: 'Combine weak colonies — a weak hive rarely survives winter alone' },
      { priority: 'low', text: 'Harvest fall honey (goldenrod) if supers are full and capped' },
    ],
    forageTip: 'Peak fall flow. Goldenrod and aster are both at maximum. Colonies are actively storing winter provisions.',
    warning: 'Yellow jackets are aggressive robbers in September. Reduce entrances and monitor for robbing attempts.',
    temp: 'Good inspection weather returning. Inspect on warm afternoons.',
  },
  {
    month: 'October',
    short: 'Final winter prep — last chance to act.',
    tasks: [
      { priority: 'high', text: 'Final hive inspection — confirm queen, stores, and healthy brood' },
      { priority: 'high', text: 'Install mouse guards — mice enter hives in October as temps drop' },
      { priority: 'high', text: 'Heft all hives — light hives MUST be fed now (2:1 syrup stops working below 50°F)' },
      { priority: 'high', text: 'Wrap or add insulation for winter if desired' },
      { priority: 'medium', text: 'Reduce all entrances to small opening' },
      { priority: 'medium', text: 'Remove empty supers — reduces drafts' },
      { priority: 'low', text: 'Extract and bottle fall honey' },
    ],
    forageTip: 'Fall flow ending. Aster and goldenrod finishing. Witch hazel beginning. Very little forage by end of month.',
    warning: 'Once temperatures consistently drop below 50°F, feeding syrup is ineffective — bees cannot process it. Feed early or use fondant.',
    temp: 'Final full inspections of the season. Act quickly — window is closing.',
  },
  {
    month: 'November',
    short: 'Winter mode. Minimal interference.',
    tasks: [
      { priority: 'high', text: 'Keep entrances clear of dead bees after cold snaps' },
      { priority: 'high', text: 'Check mouse guards are in place' },
      { priority: 'medium', text: 'Heft hives to assess stores — add candy boards if light' },
      { priority: 'medium', text: 'Apply oxalic acid dribble treatment (broodless period)' },
      { priority: 'low', text: 'Order supplies for next year' },
      { priority: 'low', text: 'Label and store harvested honey properly' },
    ],
    forageTip: 'Almost no forage. Colonies are forming winter clusters. Do not disturb unless absolutely necessary.',
    warning: 'Don\'t open hives when below 50°F — the cluster will break and bees will die. Listen by pressing ear to hive to hear healthy cluster buzz.',
    temp: 'No inspections in November unless temperatures reach 60°F+ for extended cleansing flight days.',
  },
  {
    month: 'December',
    short: 'Rest, plan, and prepare for next year.',
    tasks: [
      { priority: 'high', text: 'Heft hives regularly — starvation risk increases as winter progresses' },
      { priority: 'high', text: 'Keep entrances clear of snow and dead bees' },
      { priority: 'medium', text: 'Apply oxalic acid dribble/vaporization treatment (colony is broodless)' },
      { priority: 'medium', text: 'Order packages, nucs, and queens for spring NOW' },
      { priority: 'low', text: 'Plan apiary expansion and equipment needs for next year' },
      { priority: 'low', text: 'Give honey as gifts, attend holiday bee club events' },
    ],
    forageTip: 'No forage. Full winter cluster. The bees are surviving on stored honey and their winter cluster.',
    warning: 'December through February is the danger period for winter starvation. Keep checking hive weight.',
    temp: 'Do NOT open hives in December. Emergency feeding only via candy board placed directly on frames.',
  },
];

export function getCurrentMonthNotes() {
  const month = new Date().getMonth();
  return MONTHLY_NOTES[month];
}

export function getHighPriorityTasks(monthNotes) {
  return monthNotes.tasks.filter(t => t.priority === 'high');
}

export function getAllTasks(monthNotes) {
  return monthNotes.tasks;
}
