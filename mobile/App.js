import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  FlatList, 
  SafeAreaView
} from 'react-native';
import axios from 'axios';

export default function App() {
  // --- CONFIGURACIÓN ---
  const API_URL = "http://192.168.1.37:8000"; 

  // --- ESTADO ---
  const [naturalText, setNaturalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // --- CARGAR DATOS AL INICIO ---
  useEffect(() => {
    fetchExpenses();
  }, []);

  // --- OBTENER GASTOS DEL BACKEND ---
  const fetchExpenses = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${API_URL}/expenses/`);
      // Invertimos el array para ver los más nuevos arriba
      setExpenses(response.data.reverse());
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- INTELIGENCIA ARTIFICIAL ---
  const handleAnalyze = async () => {
    if (!naturalText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_URL}/analyze/`, { text: naturalText });
      const data = response.data;
      if (data.amount) setAmount(data.amount.toString());
      if (data.category) setCategory(data.category);
      if (data.description) setDescription(data.description);
    } catch (error) {
      Alert.alert("Error IA", "No se pudo conectar con el cerebro digital.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- GUARDAR ---
  const handleSave = async () => {
    if (!amount || !category) return Alert.alert("Faltan datos");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/expenses/`, {
        amount: parseFloat(amount),
        category: category,
        description: description,
        user_id: "demo_user",
        receipt_url: null
      });
      
      // Limpiar formulario
      setNaturalText('');
      setAmount('');
      setCategory('');
      setDescription('');
      
      // RECARGAR LA LISTA AUTOMÁTICAMENTE
      fetchExpenses(); 
      Alert.alert("¡Guardado!", "Tu dashboard ha sido actualizado.");

    } catch (error) {
      Alert.alert("Error", "Fallo al guardar");
    } finally {
      setLoading(false);
    }
  };

  // --- COMPONENTE PARA CADA FILA DE LA LISTA ---
  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseDesc}>{item.description || "Sin detalles"}</Text>
      </View>
      <View>
        <Text style={styles.expenseAmount}>- {item.amount.toFixed(2)} €</Text>
        <Text style={styles.expenseDate}>
            {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Smart Expense 📊</Text>
        </View>

        {/* LISTA PRINCIPAL (Scrollable) */}
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpenseItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={fetchExpenses} 
          ListHeaderComponent={
            <View>
              {/* SECCIÓN IA */}
              <View style={styles.aiSection}>
                <TextInput
                  style={styles.aiInput}
                  placeholder="✨ Cuéntame tu gasto..."
                  value={naturalText}
                  onChangeText={setNaturalText}
                />
                <TouchableOpacity style={styles.aiButton} onPress={handleAnalyze}>
                  {isAnalyzing ? <ActivityIndicator color="#fff"/> : <Text style={styles.aiButtonText}>🪄 Analizar</Text>}
                </TouchableOpacity>
              </View>

              {/* SECCIÓN EDICIÓN MANUAL */}
              <View style={styles.manualForm}>
                <View style={styles.row}>
                  <TextInput 
                    style={[styles.input, {flex: 0.4}]} 
                    value={amount} 
                    onChangeText={setAmount} 
                    placeholder="0.00 €" 
                    keyboardType="numeric"
                  />
                  <TextInput 
                    style={[styles.input, {flex: 0.6, marginLeft: 10}]} 
                    value={category} 
                    onChangeText={setCategory} 
                    placeholder="Categoría" 
                  />
                </View>
                <TextInput 
                  style={styles.input} 
                  value={description} 
                  onChangeText={setDescription} 
                  placeholder="Descripción" 
                />
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>{loading ? "Guardando..." : "Guardar Gasto"}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.historyTitle}>Últimos Movimientos</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === "android" ? 30 : 0
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  // IA Styles
  aiSection: {
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#C7D2FE',
    borderWidth: 1
  },
  aiInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16
  },
  aiButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  aiButtonText: { color: 'white', fontWeight: 'bold' },
  // Form Styles
  manualForm: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  // History Styles
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    marginLeft: 5
  },
  expenseItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  expenseLeft: { flex: 1 },
  expenseCategory: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  expenseDesc: { color: '#6B7280', fontSize: 14 },
  expenseAmount: { fontWeight: 'bold', fontSize: 16, color: '#DC2626' }, // Rojo para gastos
  expenseDate: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 4 }
});