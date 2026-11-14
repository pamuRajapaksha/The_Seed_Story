
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

type Seed = {
  id: number;
  name: string;
  category: string;
};

export default function PlantingTrackerScreen() {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<number | null>(null);
  const [plantingDate, setPlantingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  // Load saved seeds from database
  useFocusEffect(
    useCallback(() => {
      try {
        const savedSeeds = db.getAllSync<Seed>(
          'SELECT id, name, category FROM seeds ORDER BY name'
        );
        setSeeds(savedSeeds);
      } catch (error) {
        console.error('Error loading seeds:', error);
        Alert.alert('Error', 'Could not load seeds.');
      }
    }, [])
  );

  // Save planting details
  const savePlanting = () => {
    if (selectedSeed === null) {
      Alert.alert('Missing Details', 'Please select a seed.');
      return;
    }

    if (!plantingDate.trim()) {
      Alert.alert('Missing Details', 'Please enter planting date.');
      return;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(plantingDate) ||
      Number.isNaN(Date.parse(plantingDate)) ||
      new Date(plantingDate).toISOString().slice(0, 10) !== plantingDate
    ) {
      Alert.alert(
        'Invalid Date',
        'Please enter a valid date in YYYY-MM-DD format.'
      );
      return;
    }

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      Alert.alert(
        'Invalid Quantity',
        'Please enter a valid quantity greater than zero.'
      );
      return;
    }

    try {
      db.runSync(
        `INSERT INTO plantings
        (seed_id, planting_date, quantity, notes)
        VALUES (?, ?, ?, ?)`,
        selectedSeed,
        plantingDate,
        amount,
        notes.trim()
      );

      Alert.alert(
        'Success!',
        'Planting details saved successfully! 🌱'
      );

      setSelectedSeed(null);
      setPlantingDate(new Date().toISOString().slice(0, 10));
      setQuantity('');
      setNotes('');
    } catch (error) {
      console.error('Error saving planting:', error);
      Alert.alert('Error', 'Could not save planting details.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Planting Tracker 🌱</Text>
          <Text style={styles.subtitle}>
            Record your planting activities.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Select a Seed</Text>

          {seeds.length === 0 ? (
            <Text style={styles.emptyText}>
              No seeds available. Please add a seed first.
            </Text>
          ) : (
            <View style={styles.seedList}>
              {seeds.map((seed) => (
                <TouchableOpacity
                  key={seed.id}
                  style={[
                    styles.seedOption,
                    selectedSeed === seed.id &&
                      styles.selectedSeedOption,
                  ]}
                  onPress={() => setSelectedSeed(seed.id)}
                >
                  <Text
                    style={[
                      styles.seedOptionText,
                      selectedSeed === seed.id &&
                        styles.selectedSeedText,
                    ]}
                  >
                    🌱 {seed.name} ({seed.category})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Planting Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={plantingDate}
            onChangeText={setPlantingDate}
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of seeds"
            keyboardType="number-pad"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add planting notes..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={savePlanting}
          >
            <Text style={styles.saveButtonText}>
              Save Planting 🌿
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
    marginTop: 15,
    marginBottom: 8,
  },
  seedList: {
    gap: 10,
  },
  seedOption: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F4F8F1',
    borderWidth: 1,
    borderColor: '#DCE8D9',
  },
  selectedSeedOption: {
    backgroundColor: '#DCEEDB',
    borderColor: '#4C8756',
    borderWidth: 2,
  },
  seedOptionText: {
    fontSize: 14,
    color: '#444444',
  },
  selectedSeedText: {
    color: '#245C35',
    fontWeight: 'bold',
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
    height: 100,
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
