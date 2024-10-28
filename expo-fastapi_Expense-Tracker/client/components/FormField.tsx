import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import CustomCalendar from './CustomCalendar'

const TransactionForm: React.FC = () => {
  const [transactionType, setTransactionType] = useState<'Income' | 'Expense'>('Income')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const handleToggleType = () => {
    setTransactionType(transactionType === 'Income' ? 'Expense' : 'Income');
  }

  const handleDateSelection = (date: string) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  return (
    <View className="p-4 bg-gray-100 rounded-lg w-96">
        {/* Toggle Button for Income/Expense */}
        <View className="flex-row mb-10">
            <TouchableOpacity
                className={`flex-1 p-4 rounded-lg ${transactionType === 'Income' ? 'bg-green-500' : 'bg-gray-300'}`}
                onPress={() => setTransactionType('Income')}
                >
                <Text className="text-center text-white font-rsemibold">Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className={`flex-1 p-4 rounded-lg ml-2 ${transactionType === 'Expense' ? 'bg-red-500' : 'bg-gray-300'}`}
                onPress={() => setTransactionType('Expense')}
            >
                <Text className="text-center text-white font-rsemibold">Expense</Text>
            </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View className="mb-4">
            <Text className="text-lg font-rsemibold mb-2">Amount</Text>
            <TextInput
                className="p-4 bg-white rounded-lg border border-gray-300"
                keyboardType="numeric"
                placeholder="Enter amount"
                value={amount}
                font-rregular
                onChangeText={setAmount}
            />
        </View>

        {/* Description Input */}
        <View className="mb-4">
            <Text className="text-lg font-rsemibold mb-2">Description</Text>
            <TextInput
                className="p-4 bg-white rounded-lg border border-gray-300"
                placeholder="Enter description"
                multiline
                numberOfLines={3}
                value={description}
                font-rregular
                onChangeText={setDescription}
            />
        </View>

        {/* Date Selector */}
        <View className="mb-4">
            <Text className="text-lg font-rsemibold mb-2">Date</Text>
            <TouchableOpacity
                className="p-4 bg-white rounded-lg border border-gray-300"
                onPress={() => setShowCalendar(true)}
            >
                <Text className="text-gray-700">
                {selectedDate || 'Select a date'}
                </Text>
            </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} animationType="slide" transparent>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="w-11/12 bg-white p-4 rounded-lg">
                <CustomCalendar onDateSelect={handleDateSelection} />
                <TouchableOpacity
                    className="mt-4 p-2 bg-gray-200 rounded-lg"
                    onPress={() => setShowCalendar(false)}
                >
                    <Text className="text-center font-semibold text-gray-600">Close</Text>
                </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </View>
  )
}

export default TransactionForm
