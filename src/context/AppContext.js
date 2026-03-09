import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [harvests, setHarvests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [hivesData, inspectionsData, harvestsData] = await Promise.all([
        AsyncStorage.getItem('hives'),
        AsyncStorage.getItem('inspections'),
        AsyncStorage.getItem('harvests'),
      ]);
      if (hivesData) setHives(JSON.parse(hivesData));
      if (inspectionsData) setInspections(JSON.parse(inspectionsData));
      if (harvestsData) setHarvests(JSON.parse(harvestsData));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }

  async function saveHives(updated) {
    setHives(updated);
    await AsyncStorage.setItem('hives', JSON.stringify(updated));
  }

  async function saveInspections(updated) {
    setInspections(updated);
    await AsyncStorage.setItem('inspections', JSON.stringify(updated));
  }

  async function saveHarvests(updated) {
    setHarvests(updated);
    await AsyncStorage.setItem('harvests', JSON.stringify(updated));
  }

  function addHive(hive) {
    const updated = [...hives, { ...hive, id: Date.now().toString() }];
    saveHives(updated);
  }

  function updateHive(id, data) {
    const updated = hives.map(h => (h.id === id ? { ...h, ...data } : h));
    saveHives(updated);
  }

  function deleteHive(id) {
    saveHives(hives.filter(h => h.id !== id));
    saveInspections(inspections.filter(i => i.hiveId !== id));
    saveHarvests(harvests.filter(h => h.hiveId !== id));
  }

  function addInspection(inspection) {
    const updated = [...inspections, { ...inspection, id: Date.now().toString(), date: new Date().toISOString() }];
    saveInspections(updated);
  }

  function addHarvest(harvest) {
    const updated = [...harvests, { ...harvest, id: Date.now().toString(), date: new Date().toISOString() }];
    saveHarvests(updated);
  }

  function getHiveInspections(hiveId) {
    return inspections.filter(i => i.hiveId === hiveId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getHiveHarvests(hiveId) {
    return harvests.filter(h => h.hiveId === hiveId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return (
    <AppContext.Provider value={{
      hives, inspections, harvests,
      addHive, updateHive, deleteHive,
      addInspection, addHarvest,
      getHiveInspections, getHiveHarvests,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
