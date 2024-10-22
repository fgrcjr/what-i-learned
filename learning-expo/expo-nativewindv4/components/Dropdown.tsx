import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface DropdownProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selectedValue, onValueChange, placeholder }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="h-14 border border-gray-300 mb-4 p-2 rounded flex-row items-center justify-between"
      >
        <Text className={selectedValue === '' ? 'text-gray-400' : 'text-black'}>
          {selectedValue === '' ? placeholder : selectedValue}
        </Text>
        <Text className="text-gray-600">▼</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-96 bg-white rounded p-4">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value);
                    setIsVisible(false);
                  }}
                  className="p-2 hover:bg-gray-200"
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              className="bg-red-500 p-2 rounded mt-4 items-center"
            >
              <Text className="text-white text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Dropdown;
