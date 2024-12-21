import notifee, {AndroidImportance} from '@notifee/react-native'; // 通知ライブラリをインポート
import messaging from '@react-native-firebase/messaging';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {Colors, Header} from 'react-native/Libraries/NewAppScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // 通知チャネルの作成 (Android専用)
  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  };

  // FCMトークンを初期化して取得
  const initializeMessaging = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);
    } catch (error) {
      console.error('FCMトークンの取得エラー:', error);
    }

    // フォアグラウンドで通知を受信
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground Notification:', remoteMessage);
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
        },
      });
    });
  };

  // アプリがバックグラウンドまたはクローズド状態での通知処理
  const setupBackgroundNotifications = () => {
    // アプリがバックグラウンドの時に通知を受信
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background:', remoteMessage);
      Alert.alert('通知をクリックしました', JSON.stringify(remoteMessage));
    });

    // アプリが完全に閉じた状態で通知を受信
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened from quit state:', remoteMessage);
          Alert.alert(
            '通知をクリックしてアプリが起動しました',
            JSON.stringify(remoteMessage),
          );
        }
      });
  };

  useEffect(() => {
    createNotificationChannel(); // Androidで通知チャネルを作成
    initializeMessaging(); // 初期化処理
    setupBackgroundNotifications(); // バックグラウンド処理をセットアップ
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
