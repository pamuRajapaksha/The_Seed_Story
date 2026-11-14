
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { db } from '@/database/database';

type Planting = {
  id: number;
  seed_name: string;
  planting_date: string;
  quantity: number;
};

export default function HarvestTrackerScreen() {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [selectedPlanting, setSelectedPlanting] = useState<number | null>(null);
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useFocusEffect(
    useCallback(() => {
      try {
        const savedPlantings = db.getAllSync<Planting>(`
          SELECT
            plantings.id,
            seeds.name AS seed_name,
            plantings.planting_date,
            plantings.quantity
          FROM plantings
          JOIN seeds ON seeds.id = plantings.seed_id
          ORDER BY plantings.id DESC
        `);

        setPlantings(savedPlantings);
      } catch (error) {
        console.error('Error loading plantings:', error);
        Alert.alert('Error', 'Could not load planting records.');
      }
    }, [])
  );

  const saveHarvest = () => {
    if (selectedPlanting === null) {
      Alert.alert('Missing Details', 'Please select a plant.');
      return;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(harvestDate) ||
      Number.isNaN(Date.parse(harvestDate)) ||
      new Date(harvestDate).toISOString().slice(0, 10) !== harvestDate
    ) {
      Alert.alert('Invalid Date', 'Enter a valid date (YYYY-MM-DD).');
      return;
    }

    const harvestQuantity = Number(quantity);

    if (!Number.isInteger(harvestQuantity) || harvestQuantity <= 0) {
      Alert.alert(
        'Invalid Quantity',
        'Please enter a whole number greater than zero.'
      );
      return;
    }

    let harvestWeight: number | null = null;

    if (weight.trim() !== '') {
      harvestWeight = Number(weight);

      if (!Number.isFinite(harvestWeight) || harvestWeight <= 0) {
        Alert.alert(
          'Invalid Weight',
          'Please enter a valid weight greater than zero.'
        );
        return;
      }
    }

    try {
      db.runSync(
        `INSERT INTO harvests
        (planting_id, harvest_date, quantity, weight, notes)
        VALUES (?, ?, ?, ?, ?)`,
        selectedPlanting,
        harvestDate,
        harvestQuantity,
        harvestWeight,
        notes.trim()
      );

      Alert.alert('Success!', 'Harvest details saved successfully! 🌾');

      setSelectedPlanting(null);
      setHarvestDate(new Date().toISOString().slice(0, 10));
      setQuantity('');
      setWeight('');
      setNotes('');
    } catch (error) {
      console.error('Error saving harvest:', error);
      Alert.alert('Error', 'Could not save harvest details.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Harvest Tracker 🌾</Text>
          <Text style={styles.subtitle}>
            Record and celebrate your harvest.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Select Plant</Text>

          {plantings.length === 0 ? (
            <Text style={styles.emptyText}>
              No planting records found. Please save a planting first.
            </Text>
          ) : (
            plantings.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.plantOption,
                  selectedPlanting === item.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedPlanting(item.id)}
              >
                <Text style={styles.plantName}>
                  🌱 {item.seed_name}
                </Text>
                <Text style={styles.plantDetails}>
                  Planted: {item.planting_date} | Quantity: {item.quantity}
                </Text>
                {selectedPlanting === item.id && (
                  <Text style={styles.selectedText}>Selected ✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.label}>Harvest Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={harvestDate}
            onChangeText={setHarvestDate}
          />

          <Text style={styles.label}>Harvest Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter harvested quantity"
            keyboardType="number-pad"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Harvest Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter weight (optional)"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />

          <Text style={styles.label}>Harvest Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add harvest notes..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveHarvest}
          >
            <Text style={styles.saveButtonText}>
              Save Harvest 🌾
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F1',
  },
  header: {
    padding: 22,
    paddingTop: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#245C35',
  },
  subtitle: {
    fontSize: 14,
    color: '#68776B',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#245C35',
    marginTop: 18,
    marginBottom: 8,
  },
  plantOption: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F4F8F1',
    borderWidth: 1,
    borderColor: '#DCE8D9',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#DCEEDB',
    borderColor: '#4C8756',
    borderWidth: 2,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#245C35',
  },
  plantDetails: {
    fontSize: 12,
    color: '#68776B',
    marginTop: 5,
  },
  selectedText: {
    color: '#347A45',
    fontWeight: 'bold',
    marginTop: 6,
  },
  emptyText: {
    color: '#777777',
    padding: 10,
  },
  input: {
    backgroundColor: '#F8FAF7',
    borderWidth: 1,
    borderColor: '#DCE8D9',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#333333',
  },
  notesInput: {
    height: 110,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#347A45',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
