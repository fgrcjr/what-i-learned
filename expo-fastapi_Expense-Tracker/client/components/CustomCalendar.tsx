import { View, Text } from 'react-native'
import { Calendar } from 'react-native-calendars'
import React, { useState } from 'react'

type DateObject = {
    dateString: string;   // "YYYY-MM-DD" format
    day: number;          // Day of the month (1-31)
    month: number;        // Month number (1-12)
    year: number;         // Year as a four-digit number
    timestamp: number;    // Unix timestamp
}

type CustomCalendarProps = {
    onDateSelect: (date: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
  
    const handleDayPress = (day: DateObject) => {
      setSelectedDate(day.dateString)
      onDateSelect(day.dateString)
    }

    return (
        <View className='p-4 bg-white rounded-lg shadow'>
            <Text className='text-lg font-rsemibold text-center mb-2'>Select a Date</Text>
            
            <Calendar 
                current={new Date().toISOString().split('T')[0]}
                onDayPress={handleDayPress}
                markedDate={{
                    [selectedDate]:{
                        select: true,
                        selectedColor: '#5C67F2',
                        textColor: '#ffffff',
                    },
                }}
                theme={{
                    todayTextColor: '#5C67F2',
                    arrowColor: '#5C67F2',
                    selectedDayBackgroundColor: '#5C67F2',
                    selectedDayTextColor: '#ffffff',
                }}
            />
        </View>
    )
}

export default CustomCalendar