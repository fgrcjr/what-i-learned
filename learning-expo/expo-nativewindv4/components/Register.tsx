import React, { useState } from 'react';
import { View, TextInput, Text, Alert, Switch, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';  // Import the DateTimePicker
import { Picker } from '@react-native-picker/picker';  // Import the Picker component
import dayjs from 'dayjs';  // Import dayjs for date handling

interface FormData {
  amount: string;       // String input to handle float, will convert later
  category: string;
  description: string;
  income: boolean;
  date: dayjs.Dayjs;    // Use dayjs for Date handling
}

const Register: React.FC = () => {
  // Initialize the form data with dayjs for date
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    category: '0',    
    description: '',
    income: false,
    date: dayjs(),       // Use dayjs to initialize the date
  });

  // State to control DateTimePicker modal visibility
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | boolean | dayjs.Dayjs) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate amount is a valid float
    const floatAmount = parseFloat(formData.amount);
    if (isNaN(floatAmount)) {
      Alert.alert('Error', 'Please enter a valid float number for Amount.');
      return;
    }

    // Show success message and form data
    Alert.alert(
      'Success',
      `Amount: ${floatAmount}\nCategory: ${formData.category}\nDescription: ${formData.description}\nIncome: ${formData.income ? 'Yes' : 'No'}\nDate: ${formData.date.format('YYYY-MM-DD')}`
    );

    // Here, you would typically send the form data to a server or handle it accordingly
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Form</Text>

      {/* Amount Input */}
      <TextInput
        style={styles.input}
        placeholder="Amount (float)"
        keyboardType="decimal-pad"
        value={formData.amount}
        onChangeText={(value) => handleInputChange('amount', value)}
      />

      {/* Category Picker */}
      {/* <Text style={styles.label}>Category</Text> */}
      <Picker
        selectedValue={formData.category}
        onValueChange={(itemValue) => handleInputChange('category', itemValue)}
        style={styles.picker}
        
      >
        <Picker.Item label="Select Category" value="0" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Transport" value="Transport" />
        <Picker.Item label="Entertainment" value="Entertainment" />
        <Picker.Item label="Bills" value="Bills" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      {/* Description Input */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
      />

      {/* Income Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Income</Text>
        <Switch
          value={formData.income}
          onValueChange={(value) => handleInputChange('income', value)}
        />
      </View>

      {/* Button to Launch Date Picker */}
      <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Select Date</Text>
      </TouchableOpacity>

      {/* Modal for Date Picker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setIsDatePickerVisible(false)}  // Allow closing the modal by pressing back or touching outside
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pick a Date</Text>

            <DateTimePicker
              mode="single"
              date={formData.date.toDate()}  // Convert dayjs date to native Date object for picker
              onChange={({ date }) => {
                handleInputChange('date', dayjs(date));
                setIsDatePickerVisible(false);  // Hide modal after selecting a date
              }}
            />

            {/* Button to close modal without selecting a date */}
            <TouchableOpacity onPress={() => setIsDatePickerVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submit Button */}
      <View style={styles.registerButtonContainer}>
        <TouchableOpacity onPress={handleSubmit} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background
  },
  modalContent: {
    width: 350,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  datePicker: {
    marginBottom: 15,
  },
  modalCloseButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  registerButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  registerButton: {
    backgroundColor: 'black',
    paddingVertical: 19,
    borderRadius: 10,
    width: '113%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Register;
