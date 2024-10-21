import React, { useState } from 'react'
import { View, TextInput, Text, Button, Alert, Switch, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface FormData {
    amount: string,
    category: string,
    description: string,
    income: boolean,
    date: Date
}

const Register: React.FC = () => {

    const [formData, setFormData] = useState<FormData>({
        amount: '',
        category: '',
        description: '',
        income: false,
        date: new Date()
    })

    
    const [showDatePicker, setShowDatePicker] = useState(false)

    const handleInputChange = (field: keyof FormData, value: string | boolean | Date) => {
        setFormData({ ...formData, [field]: value})
    }

    const handleSubmit = () => {
        const strToFloat = parseFloat(formData.amount)
        
        // Validate if valid float
        if(isNaN(strToFloat)){
            Alert.alert('Error', 'Please enter a valid float number for Amount.');
            return;
        }

        // Success
        Alert.alert(
            'Success',
            `Amount: ${strToFloat}\nCategory: ${formData.category}\nDescription: ${formData.description}\nIncome: ${formData.income ? 'Yes' : 'No'}\nDate: ${formData.date.toDateString()}`
        )
        setFormData({
            amount: '',
            category: '',
            description: '',
            income: false,
            date: new Date()
        })
    }

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if(selectedDate){
            handleInputChange('date', selectedDate)
        }
    } 

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Input Expense/Income</Text>
    
          {/* Amount Input */}
          <TextInput
            style={styles.input}
            placeholder="Amount (float)"
            keyboardType="decimal-pad"
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
          />
    
        {/* Category Picker */}
        <Text style={styles.label}>Category</Text>
            <Picker
                selectedValue={formData.category}
                onValueChange={(itemValue) => handleInputChange('category', itemValue)}
                style={styles.picker}
            >
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
    
          {/* Date Input */}
          <View>
            <Button title="Pick a Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            <Text style={styles.dateText}>Selected Date: {formData.date.toDateString()}</Text>
          </View>
    
          {/* Submit Button */}
          <Button title="Register" onPress={handleSubmit} />
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
      label: {
        fontSize: 16,
      },
      dateText: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
      },
    })

export default Register