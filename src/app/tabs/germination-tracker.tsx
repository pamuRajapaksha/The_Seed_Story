
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

export default function GerminationTrackerScreen() {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [selectedPlanting, setSelectedPlanting] = useState<number | null>(null);
  const [germinationDate, setGerminationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [germinatedQuantity, setGerminatedQuantity] = useState('');
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

  const saveGermination = () => {
    if (selectedPlanting === null) {
      Alert.alert('Missing Details', 'Please select a planting record.');
      return;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(germinationDate) ||
      Number.isNaN(Date.parse(germinationDate)) ||
      new Date(germinationDate).toISOString().slice(0, 10) !== germinationDate
    ) {
      Alert.alert('Invalid Date', 'Enter a valid date (YYYY-MM-DD).');
      return;
    }

    const selectedRecord = plantings.find(
      (item) => item.id === selectedPlanting
    );

    if (!selectedRecord) {
      Alert.alert('Error', 'Selected planting record was not found.');
      return;
    }

    const amount = Number(germinatedQuantity);

    if (
      !Number.isInteger(amount) ||
      amount < 0 ||
      amount > selectedRecord.quantity
    ) {
      Alert.alert(
        'Invalid Quantity',
        `Enter a number between 0 and ${selectedRecord.quantity}.`
      );
      return;
    }

    const status =
      amount === 0
        ? 'Not Germinated'
        : amount === selectedRecord.quantity
        ? 'Fully Germinated'
        : 'Partially Germinated';

    try {
      db.runSync(
        `INSERT INTO germinations
        (planting_id, germination_date, germinated_quantity, status, notes)
        VALUES (?, ?, ?, ?, ?)`,
        selectedPlanting,
        germinationDate,
        amount,
        status,
        notes.trim()
      );

      Alert.alert('Success!', 'Germination details saved successfully! 🌱');

      setSelectedPlanting(null);
      setGerminationDate(new Date().toISOString().slice(0, 10));
      setGerminatedQuantity('');
      setNotes('');
    } catch (error) {
      console.error('Error saving germination:', error);
      Alert.alert('Error', 'Could not save germination details.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Germination Tracker 🌱</Text>
          <Text style={styles.subtitle}>
            Track how many of your planted seeds have germinated.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Select Planting</Text>

          {plantings.length === 0 ? (
            <Text style={styles.emptyText}>
              No planting records found. Please save a planting first.
            </Text>
          ) : (
            plantings.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.seedOption,
                  selectedPlanting === item.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedPlanting(item.id)}
              >
                <Text style={styles.seedName}>
                  🌱 {item.seed_name}
                </Text>
                <Text style={styles.seedDetails}>
                  Planted: {item.planting_date} | Quantity: {item.quantity}
                </Text>
                {selectedPlanting === item.id && (
                  <Text style={styles.selectedText}>Selected ✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.label}>Germination Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={germinationDate}
            onChangeText={setGerminationDate}
          />

          <Text style={styles.label}>Germinated Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of germinated seeds"
            keyboardType="number-pad"
            value={germinatedQuantity}
            onChangeText={setGerminatedQuantity}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add germination notes..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveGermination}
          >
            <Text style={styles.saveButtonText}>
              Save Germination 🌿
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
    fontSize: 26,
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
  seedOption: {
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
  seedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#245C35',
  },
  seedDetails: {
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
