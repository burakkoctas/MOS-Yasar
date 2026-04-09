import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function App() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 60000); // her dakika güncelle

    return () => clearInterval(interval);
  }, []);

  const day = date.getDate();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => alert("Tıklandı!")}>
        <View style={styles.iconWrapper}>
          <Feather name="calendar" size={50} color="#2F80ED" />
          <Text style={styles.dayText}>{day}</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 20,
  },
  iconWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F80ED",
  },
});