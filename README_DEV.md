<!--
Kurulum (projeyi /Users/simge/odaki-app içinde çalıştırın):

cd /Users/simge/odaki-app

# Expo uyumlu paketler (Firebase + AsyncStorage + optional expo-constants)
npx expo install firebase @react-native-async-storage/async-storage expo-constants

# React Navigation (önceden yüklü değilse)
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Metro önbelleğini temizleyip başlatma
npx expo start -c

Gemini API Anahtarı ekleme:

app.config.js veya app.config.ts içinde extra alanına GEMINI_API_KEY ekleyin:

module.exports = {
  expo: {
    // ...existing config...
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    }
  }
};

Çevresel değişkeni terminalde ayarlamak için örnek:
export GEMINI_API_KEY="YOUR_KEY"

Metro'yu temizleyip çalıştır:
npx expo start -c
-->
# Geliştirici notları
Kısa not: firebase auth için React Native persistence kullanmak üzere initializeAuth + getReactNativePersistence(AsyncStorage) kullanılıyor. .env veya app config içinde EXPO_PUBLIC_... değişkenlerini sağlamayı unutmayın.
````
