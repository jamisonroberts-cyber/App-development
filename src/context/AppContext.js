import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [hiveInventory, setHiveInventory] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        hivesData, inspectionsData, harvestsData,
        apiarieData, inventoryData, hiveInvData, financialData,
      ] = await Promise.all([
        AsyncStorage.getItem('hives'),
        AsyncStorage.getItem('inspections'),
        AsyncStorage.getItem('harvests'),
        AsyncStorage.getItem('apiaries'),
        AsyncStorage.getItem('inventoryItems'),
        AsyncStorage.getItem('hiveInventory'),
        AsyncStorage.getItem('financialRecords'),
      ]);
      if (hivesData) setHives(JSON.parse(hivesData));
      if (inspectionsData) setInspections(JSON.parse(inspectionsData));
      if (harvestsData) setHarvests(JSON.parse(harvestsData));
      if (apiarieData) setApiaries(JSON.parse(apiarieData));
      if (inventoryData) setInventoryItems(JSON.parse(inventoryData));
      if (hiveInvData) setHiveInventory(JSON.parse(hiveInvData));
      if (financialData) setFinancialRecords(JSON.parse(financialData));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }

  // ── Save helpers ──────────────────────────────────────────────────────────

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

  async function saveApiaries(updated) {
    setApiaries(updated);
    await AsyncStorage.setItem('apiaries', JSON.stringify(updated));
  }

  async function saveInventoryItems(updated) {
    setInventoryItems(updated);
    await AsyncStorage.setItem('inventoryItems', JSON.stringify(updated));
  }

  async function saveHiveInventory(updated) {
    setHiveInventory(updated);
    await AsyncStorage.setItem('hiveInventory', JSON.stringify(updated));
  }

  async function saveFinancialRecords(updated) {
    setFinancialRecords(updated);
    await AsyncStorage.setItem('financialRecords', JSON.stringify(updated));
  }

  // ── Hive CRUD ─────────────────────────────────────────────────────────────

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
    saveHiveInventory(hiveInventory.filter(r => r.hiveId !== id));
  }

  // ── Apiary CRUD ───────────────────────────────────────────────────────────

  function addApiary(apiary) {
    const updated = [...apiaries, { ...apiary, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    saveApiaries(updated);
  }

  function updateApiary(id, data) {
    const updated = apiaries.map(a => (a.id === id ? { ...a, ...data } : a));
    saveApiaries(updated);
  }

  function deleteApiary(id) {
    saveApiaries(apiaries.filter(a => a.id !== id));
    // Unassign hives from this apiary rather than deleting them
    const updatedHives = hives.map(h => h.apiaryId === id ? { ...h, apiaryId: null } : h);
    saveHives(updatedHives);
  }

  // ── Inspection CRUD ───────────────────────────────────────────────────────

  function addInspection(inspection) {
    const updated = [...inspections, { ...inspection, id: Date.now().toString(), date: new Date().toISOString() }];
    saveInspections(updated);
  }

  function updateInspection(id, data) {
    const updated = inspections.map(i => (i.id === id ? { ...i, ...data } : i));
    saveInspections(updated);
  }

  // ── Harvest CRUD ──────────────────────────────────────────────────────────

  function addHarvest(harvest) {
    const updated = [...harvests, { ...harvest, id: Date.now().toString(), date: new Date().toISOString() }];
    saveHarvests(updated);
  }

  // ── Inventory CRUD ────────────────────────────────────────────────────────

  function addInventoryItem(item) {
    const updated = [...inventoryItems, { ...item, id: Date.now().toString() }];
    saveInventoryItems(updated);
  }

  function updateInventoryItem(id, data) {
    const updated = inventoryItems.map(i => (i.id === id ? { ...i, ...data } : i));
    saveInventoryItems(updated);
  }

  function deleteInventoryItem(id) {
    saveInventoryItems(inventoryItems.filter(i => i.id !== id));
    saveHiveInventory(hiveInventory.filter(r => r.inventoryItemId !== id));
  }

  function addHiveInventoryRecord(record) {
    const updated = [...hiveInventory, { ...record, id: Date.now().toString(), appliedAt: new Date().toISOString() }];
    saveHiveInventory(updated);
  }

  function removeHiveInventoryRecord(id) {
    saveHiveInventory(hiveInventory.filter(r => r.id !== id));
  }

  // ── Financial CRUD ────────────────────────────────────────────────────────

  function addFinancialRecord(record) {
    const updated = [...financialRecords, { ...record, id: Date.now().toString() }];
    saveFinancialRecords(updated);
  }

  function deleteFinancialRecord(id) {
    saveFinancialRecords(financialRecords.filter(r => r.id !== id));
  }

  // ── Selector / query functions ────────────────────────────────────────────

  function getHiveInspections(hiveId) {
    return inspections.filter(i => i.hiveId === hiveId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getHiveHarvests(hiveId) {
    return harvests.filter(h => h.hiveId === hiveId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getApiaryHives(apiaryId) {
    return hives.filter(h => h.apiaryId === apiaryId);
  }

  function getUnassignedHives() {
    return hives.filter(h => !h.apiaryId);
  }

  function getHiveInventoryCost(hiveId) {
    const records = hiveInventory.filter(r => r.hiveId === hiveId);
    return records.reduce((total, record) => {
      const item = inventoryItems.find(i => i.id === record.inventoryItemId);
      if (!item) return total;
      return total + (parseFloat(record.quantity) || 0) * (parseFloat(item.unitCost) || 0);
    }, 0);
  }

  function getHiveInventoryRecords(hiveId) {
    return hiveInventory
      .filter(r => r.hiveId === hiveId)
      .map(r => ({ ...r, item: inventoryItems.find(i => i.id === r.inventoryItemId) }))
      .filter(r => r.item);
  }

  function getHoneyYieldByMonth() {
    const result = {};
    harvests.forEach(h => {
      const date = new Date(h.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      result[key] = (result[key] || 0) + (parseFloat(h.amountKg) || 0);
    });
    return result;
  }

  function getTotalRevenue() {
    return financialRecords
      .filter(r => r.type === 'revenue')
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }

  function getTotalExpenses() {
    return financialRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }

  function getTotalHoneyKg() {
    return harvests.reduce((sum, h) => sum + (parseFloat(h.amountKg) || 0), 0);
  }

  return (
    <AppContext.Provider value={{
      // State
      hives, inspections, harvests,
      apiaries, inventoryItems, hiveInventory, financialRecords,
      // Hive
      addHive, updateHive, deleteHive,
      // Apiary
      addApiary, updateApiary, deleteApiary,
      // Inspection
      addInspection, updateInspection,
      // Harvest
      addHarvest,
      // Inventory
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      addHiveInventoryRecord, removeHiveInventoryRecord,
      // Financial
      addFinancialRecord, deleteFinancialRecord,
      // Selectors
      getHiveInspections, getHiveHarvests,
      getApiaryHives, getUnassignedHives,
      getHiveInventoryCost, getHiveInventoryRecords,
      getHoneyYieldByMonth, getTotalRevenue, getTotalExpenses, getTotalHoneyKg,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
