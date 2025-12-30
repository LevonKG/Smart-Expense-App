import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

export default function App() {
  // --- CONFIGURACIÓN ---
  const API_URL = "http://192.168.1.37:8000"; 

  // --- ESTADO ---
  // Input para la IA
  const [naturalText, setNaturalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Inputs del Formulario Final
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN: MAGIA IA ---
  const handleAnalyze = async () => {
    if (!naturalText.trim()) return;

    setIsAnalyzing(true);
    try {
      console.log("Enviando a IA:", naturalText);
      const response = await axios.post(`${API_URL}/analyze/`, {
        text: naturalText
      });

      const data = response.data;
      console.log("Respuesta IA:", data);

      if (data.amount) setAmount(data.amount.toString());
      if (data.category) setCategory(data.category);
      if (data.description) setDescription(data.description);

    } catch (error) {
      console.error(error);
      Alert.alert("Error IA", "No pude entender el gasto via red.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- FUNCIÓN: GUARDAR EN BASE DE DATOS ---
  const handleSave = async () => {
    if (!amount || !category) {
      Alert.alert("Faltan datos", "Revisa que haya cantidad y categoría");
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        amount: parseFloat(amount),
        category: category,
        description: description,
        user_id: "usuario_demo_ia",
        receipt_url: null
      };

      const response = await axios.post(`${API_URL}/expenses/`, expenseData);
      
      Alert.alert("¡Guardado! ✅", `ID: ${response.data.id} guardado en la nube.`);
      
      setNaturalText('');
      setAmount('');
      setCategory('');
      setDescription('');

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Fallo al guardar en Supabase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Smart Expense 🧠</Text>

        {/* --- SECCIÓN IA --- */}
        <View style={styles.aiSection}>
          <Text style={styles.sectionLabel}>✨ Registro Rápido</Text>
          <TextInput
            style={styles.aiInput}
            placeholder="Ej: Cena con amigos 45 euros"
            value={naturalText}
            onChangeText={setNaturalText}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            style={styles.aiButton} 
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.aiButtonText}>Analizar con Gemini</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* --- SECCIÓN FORMULARIO --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Confirmar Datos</Text>
          
          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.label}>Cantidad</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Categoría</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Categoría"
              />
            </View>
          </View>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Detalles..."
          />

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Guardando..." : "Guardar Gasto"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Estilos IA
  aiSection: {
    backgroundColor: '#EEF2FF', // Azul muy claro
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aiInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  aiButton: {
    backgroundColor: '#4F46E5', // Indigo
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos Formulario
  formSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#10B981', // Verde Esmeralda
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#6EE7B7',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});