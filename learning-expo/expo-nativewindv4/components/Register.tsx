import React, { useState } from 'react';
import { View, TextInput, Text, Alert, Switch, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

import Dropdown from './Dropdown';

interface FormData {
  amount: string;       // String input to handle float, will convert later
  category: string;
  description: string;
  income: boolean;
  date: dayjs.Dayjs;   // Use dayjs for Date handling
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    category: '',
    description: '',
    income: false,
    date: dayjs(),
  });

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | boolean | dayjs.Dayjs) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const floatAmount = parseFloat(formData.amount);
    if (isNaN(floatAmount)) {
      Alert.alert('Error', 'Please enter a valid float number for Amount.');
      return;
    }

    Alert.alert(
      'Success',
      `Amount: ${floatAmount}\nCategory: ${formData.category}\nDescription: ${formData.description}\nIncome: ${formData.income ? 'Yes' : 'No'}\nDate: ${formData.date.format('YYYY-MM-DD')}`
    );
  };

  const categories = [
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Other', value: 'Other' },
  ];

  return (
    <SafeAreaView className="px-5"> 
      <Text className="text-3xl font-extrabold mb-10 text-center">Finance App</Text>

      <TextInput
        className="h-14 border border-gray-300 mb-4 p-2 rounded"
        placeholder="Amount (float)"
        keyboardType="decimal-pad"
        value={formData.amount}
        onChangeText={(value) => handleInputChange('amount', value)}
      />

      <Dropdown
        options={categories}
        selectedValue={formData.category}
        onValueChange={(value) => handleInputChange('category', value)}
        placeholder="Select Category"
      />

      <TextInput
        className="h-14 border border-gray-300 mb-4 p-2 rounded"
        placeholder="Description"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
      />

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg">Income</Text>
        <Switch
          value={formData.income}
          onValueChange={(value) => handleInputChange('income', value)}
        />
      </View>

      <TouchableOpacity
        onPress={() => setIsDatePickerVisible(true)}
        className="bg-blue-500 p-3 rounded mb-4 items-center"
      >
        <Text className="text-white text-lg">Select Date</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-96 bg-white rounded p-7 items-center">

            <DateTimePicker
              mode="single"
              date={formData.date.toDate()}
              onChange={({ date }) => {
                handleInputChange('date', dayjs(date));
                setIsDatePickerVisible(false);
              }}
            />

            <TouchableOpacity
              onPress={() => setIsDatePickerVisible(false)}
              className="bg-red-500 p-2 rounded mt-4 items-center"
            >
              <Text className="w-14 text-white text-lg text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="w-full pb-5">
        <TouchableOpacity onPress={handleSubmit} className="bg-black py-4 rounded">
          <Text className="text-white text-lg font-bold text-center">Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Register;
