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
  Platform 
} from 'react-native';
import axios from 'axios';

export default function App() {
  // --- CONFIGURACIÓN ---
  // IMPORTANTE: Pon aquí tu IP Local (la misma que usaste antes)
  const API_URL = "http://192.168.1.37:8000"; 

  // --- ESTADO DEL FORMULARIO ---
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN PARA GUARDAR ---
  const handleSave = async () => {
    // 1. Validaciones básicas
    if (!amount || !category) {
      Alert.alert("Error", "Por favor ingresa cantidad y categoría");
      return;
    }

    setLoading(true);

    try {
      // 2. Preparar los datos (coincidiendo con schemas.py del backend)
      const expenseData = {
        amount: parseFloat(amount), // Convertir texto a número
        category: category,
        description: description,
        user_id: "usuario_prueba_movil", // Hardcodeado por ahora (Fase 1)
        receipt_url: null // Aún no enviamos fotos
      };

      // 3. Enviar al Backend
      const response = await axios.post(`${API_URL}/expenses/`, expenseData);

      // 4. Éxito
      Alert.alert("¡Guardado! ✅", `Gasto registrado con ID: ${response.data.id}`);
      
      // Limpiar formulario
      setAmount('');
      setCategory('');
      setDescription('');

    } catch (error) {
      console.error(error);
      Alert.alert("Error ❌", "No se pudo guardar el gasto. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nuevo Gasto 💸</Text>

        {/* INPUT: CANTIDAD */}
        <Text style={styles.label}>Cantidad (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* INPUT: CATEGORÍA */}
        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Comida, Transporte..."
          value={category}
          onChangeText={setCategory}
        />

        {/* INPUT: DESCRIPCIÓN */}
        <Text style={styles.label}>Descripción (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Menú del día"
          value={description}
          onChangeText={setDescription}
        />

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Guardando..." : "Guardar Gasto"}
          </Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

// --- ESTILOS (Look & Feel moderno) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Gris muy suave
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563EB', // Azul profesional
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});