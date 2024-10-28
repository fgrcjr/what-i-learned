import { Text, View } from 'react-native';
import TransactionForm from '@/components/FormField';

export default function RegisterScreen() {
  return (
    <View className='flex-1 bg-primary items-center justify-center'>
      
      <TransactionForm />
    </View>
  );
}