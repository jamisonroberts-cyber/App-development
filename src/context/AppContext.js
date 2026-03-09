import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const SAMPLE_APIARY = {
  id: 'apiary_sample_1',
  name: 'Home Yard',
  location: 'Asheboro, NC',
  notes: 'Backyard apiary — south-facing, near woods',
  created: new Date('2024-03-01').toISOString(),
};

const SAMPLE_HIVES = [
  {
    id: 'hive_sample_1',
    apiaryId: 'apiary_sample_1',
    name: 'Hive 1 – Beatrice',
    type: 'Langstroth 10-frame',
    color: '#F5A623',
    established: '2024-03-15',
    queenBreed: 'Italian',
    queenSource: 'Local Breeder',
    queenYear: '2024',
    queenMarked: true,
    queenColor: 'Blue',
    status: 'Active',
    notes: 'Strong colony, good temperament. First-year queen.',
    weight: '72',
    boxes: '2 deeps + 1 medium super',
  },
  {
    id: 'hive_sample_2',
    apiaryId: 'apiary_sample_1',
    name: 'Hive 2 – Maple',
    type: 'Langstroth 10-frame',
    color: '#5B8A3C',
    established: '2024-04-01',
    queenBreed: 'Carniolan',
    queenSource: 'Package',
    queenYear: '2024',
    queenMarked: false,
    queenColor: 'None',
    status: 'Active',
    notes: 'Good buildup. Slightly defensive on hot days.',
    weight: '65',
    boxes: '2 deeps',
  },
];

const SAMPLE_INSPECTIONS = [
  {
    id: 'insp_s1',
    hiveId: 'hive_sample_1',
    type: 'detailed',
    date: new Date('2025-03-01').toISOString(),
    queenSeen: true,
    eggs: true,
    larvae: true,
    cappedBrood: true,
    broodPattern: 'Solid',
    queenCells: false,
    swarmCells: false,
    temperament: '3',
    populationEstimate: 'Strong (8+ frames)',
    pollen: true,
    storesAdequate: true,
    miteCount: '1.2',
    miteMethod: 'Alcohol Wash',
    treatment: 'None',
    hygienic: true,
    weight: '70',
    notes: 'Great colony heading into spring. Queen is laying well.',
  },
  {
    id: 'insp_s2',
    hiveId: 'hive_sample_2',
    type: 'quick',
    date: new Date('2025-03-01').toISOString(),
    queenSeen: false,
    eggsPresent: true,
    temperament: '2',
    storesAdequate: true,
    miteCount: '2.1',
    notes: 'Good activity at entrance. Did not find queen but eggs present.',
  },
  {
    id: 'insp_s3',
    hiveId: 'hive_sample_1',
    type: 'detailed',
    date: new Date('2025-04-15').toISOString(),
    queenSeen: true,
    eggs: true,
    larvae: true,
    cappedBrood: true,
    broodPattern: 'Solid',
    queenCells: true,
    swarmCells: false,
    temperament: '3',
    populationEstimate: 'Very Strong (10+ frames)',
    pollen: true,
    storesAdequate: true,
    miteCount: '1.8',
    miteMethod: 'Alcohol Wash',
    treatment: 'None',
    hygienic: true,
    weight: '82',
    notes: 'Found 2 queen cells on frame 4 bottom. Made a split. Added a medium super.',
  },
];

const SAMPLE_HARVESTS = [
  {
    id: 'harv_s1',
    hiveId: 'hive_sample_1',
    date: new Date('2025-05-20').toISOString(),
    amountLbs: '18',
    honeyType: 'Tulip Poplar',
    frames: '6',
    notes: 'First honey harvest! Beautiful dark gold color.',
    year: '2025',
  },
  {
    id: 'harv_s2',
    hiveId: 'hive_sample_2',
    date: new Date('2025-05-20').toISOString(),
    amountLbs: '10',
    honeyType: 'Tulip Poplar',
    frames: '4',
    notes: 'Lighter harvest — colony was newer this year.',
    year: '2025',
  },
  {
    id: 'harv_s3',
    hiveId: 'hive_sample_1',
    date: new Date('2025-08-05').toISOString(),
    amountLbs: '12',
    honeyType: 'Sourwood',
    frames: '5',
    notes: 'Sourwood honey — light and aromatic.',
    year: '2025',
  },
];

export function AppProvider({ children }) {
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ap, hv, ins, har, init] = await Promise.all([
        AsyncStorage.getItem('apiaries_v2'),
        AsyncStorage.getItem('hives_v2'),
        AsyncStorage.getItem('inspections_v2'),
        AsyncStorage.getItem('harvests_v2'),
        AsyncStorage.getItem('app_initialized'),
      ]);
      if (!init) {
        await Promise.all([
          AsyncStorage.setItem('apiaries_v2', JSON.stringify([SAMPLE_APIARY])),
          AsyncStorage.setItem('hives_v2', JSON.stringify(SAMPLE_HIVES)),
          AsyncStorage.setItem('inspections_v2', JSON.stringify(SAMPLE_INSPECTIONS)),
          AsyncStorage.setItem('harvests_v2', JSON.stringify(SAMPLE_HARVESTS)),
          AsyncStorage.setItem('app_initialized', 'true'),
        ]);
        setApiaries([SAMPLE_APIARY]);
        setHives(SAMPLE_HIVES);
        setInspections(SAMPLE_INSPECTIONS);
        setHarvests(SAMPLE_HARVESTS);
      } else {
        if (ap) setApiaries(JSON.parse(ap));
        if (hv) setHives(JSON.parse(hv));
        if (ins) setInspections(JSON.parse(ins));
        if (har) setHarvests(JSON.parse(har));
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setInitialized(true);
    }
  }

  async function saveApiaries(updated) {
    setApiaries(updated);
    await AsyncStorage.setItem('apiaries_v2', JSON.stringify(updated));
  }
  function addApiary(apiary) {
    const n = { ...apiary, id: `apiary_${Date.now()}`, created: new Date().toISOString() };
    saveApiaries([...apiaries, n]);
    return n;
  }
  function updateApiary(id, data) {
    saveApiaries(apiaries.map(a => (a.id === id ? { ...a, ...data } : a)));
  }
  function deleteApiary(id) {
    const hiveIds = hives.filter(h => h.apiaryId === id).map(h => h.id);
    saveApiaries(apiaries.filter(a => a.id !== id));
    const rh = hives.filter(h => h.apiaryId !== id);
    setHives(rh); AsyncStorage.setItem('hives_v2', JSON.stringify(rh));
    const ri = inspections.filter(i => !hiveIds.includes(i.hiveId));
    setInspections(ri); AsyncStorage.setItem('inspections_v2', JSON.stringify(ri));
    const rv = harvests.filter(h => !hiveIds.includes(h.hiveId));
    setHarvests(rv); AsyncStorage.setItem('harvests_v2', JSON.stringify(rv));
  }
  function getApiaryHives(apiaryId) { return hives.filter(h => h.apiaryId === apiaryId); }

  async function saveHives(updated) {
    setHives(updated);
    await AsyncStorage.setItem('hives_v2', JSON.stringify(updated));
  }
  function addHive(hive) {
    const n = { ...hive, id: `hive_${Date.now()}`, created: new Date().toISOString() };
    saveHives([...hives, n]);
    return n;
  }
  function updateHive(id, data) { saveHives(hives.map(h => (h.id === id ? { ...h, ...data } : h))); }
  function deleteHive(id) {
    saveHives(hives.filter(h => h.id !== id));
    const ri = inspections.filter(i => i.hiveId !== id);
    setInspections(ri); AsyncStorage.setItem('inspections_v2', JSON.stringify(ri));
    const rv = harvests.filter(h => h.hiveId !== id);
    setHarvests(rv); AsyncStorage.setItem('harvests_v2', JSON.stringify(rv));
  }

  async function saveInspections(updated) {
    setInspections(updated);
    await AsyncStorage.setItem('inspections_v2', JSON.stringify(updated));
  }
  function addInspection(inspection) {
    const n = { ...inspection, id: `insp_${Date.now()}`, date: new Date().toISOString() };
    saveInspections([...inspections, n]);
    return n;
  }
  function deleteInspection(id) { saveInspections(inspections.filter(i => i.id !== id)); }
  function getHiveInspections(hiveId) {
    return inspections.filter(i => i.hiveId === hiveId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  function getLatestInspection(hiveId) {
    const list = getHiveInspections(hiveId);
    return list.length > 0 ? list[0] : null;
  }

  async function saveHarvests(updated) {
    setHarvests(updated);
    await AsyncStorage.setItem('harvests_v2', JSON.stringify(updated));
  }
  function addHarvest(harvest) {
    const n = { ...harvest, id: `harv_${Date.now()}`, date: new Date().toISOString(), year: new Date().getFullYear().toString() };
    saveHarvests([...harvests, n]);
    return n;
  }
  function deleteHarvest(id) { saveHarvests(harvests.filter(h => h.id !== id)); }
  function getHiveHarvests(hiveId) {
    return harvests.filter(h => h.hiveId === hiveId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getTotalHoneyLbs() { return harvests.reduce((s, h) => s + (parseFloat(h.amountLbs) || 0), 0); }
  function getHoneyByYear() {
    const by = {};
    harvests.forEach(h => {
      const yr = h.year || new Date(h.date).getFullYear().toString();
      by[yr] = (by[yr] || 0) + (parseFloat(h.amountLbs) || 0);
    });
    return by;
  }
  function getMiteCountHistory() {
    return inspections
      .filter(i => i.miteCount && parseFloat(i.miteCount) > 0)
      .map(i => ({
        date: i.date,
        hiveId: i.hiveId,
        hiveName: hives.find(h => h.id === i.hiveId)?.name || 'Unknown',
        count: parseFloat(i.miteCount),
        method: i.miteMethod || 'Unknown',
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  function getHivesByGenetics() {
    const by = {};
    hives.forEach(h => {
      const breed = h.queenBreed || 'Unknown';
      if (!by[breed]) by[breed] = { count: 0, hives: [] };
      by[breed].count += 1;
      by[breed].hives.push(h);
    });
    return by;
  }
  function getHiveHoneyAvg(hiveId) {
    const hh = getHiveHarvests(hiveId);
    if (!hh.length) return 0;
    return (hh.reduce((s, h) => s + (parseFloat(h.amountLbs) || 0), 0) / hh.length).toFixed(1);
  }

  return (
    <AppContext.Provider value={{
      initialized,
      apiaries, addApiary, updateApiary, deleteApiary, getApiaryHives,
      hives, addHive, updateHive, deleteHive,
      inspections, addInspection, deleteInspection, getHiveInspections, getLatestInspection,
      harvests, addHarvest, deleteHarvest, getHiveHarvests,
      getTotalHoneyLbs, getHoneyByYear, getMiteCountHistory, getHivesByGenetics, getHiveHoneyAvg,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
