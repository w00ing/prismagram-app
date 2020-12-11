import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AppLoading from "expo-app-loading";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { Text, TouchableOpacity, View } from "react-native";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import ApolloClient from "apollo-boost";
import { ThemeProvider } from "styled-components";
import { ApolloProvider } from "react-apollo-hooks";
import apolloClientOptions from "./apollo";
import styles from "./styles";
import { CustomStorage } from "./customStorage";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [client, setClient] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  // Preload stuff
  const preLoad = async () => {
    try {
      // Preload font
      await Font.loadAsync({
        ...Ionicons.font,
      });

      // Preload assets
      await Asset.loadAsync([require("./assets/logo.png")]);

      // Create cache
      const cache = new InMemoryCache();
      await persistCache({
        cache,
        storage: CustomStorage,
      });

      // Create a new apollo client
      const client = new ApolloClient({
        cache,
        ...apolloClientOptions,
      });
      const isLoggedIn = await CustomStorage.getItem("isLoggedIn");
      if (isLoggedIn === null || isLoggedIn === false) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
      setLoaded(true);
      setClient(client);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    preLoad();
  }, []);

  const logUserIn = async () => {
    try {
      await CustomStorage.setItem("isLoggedIn", true);
      setIsLoggedIn(true);
    } catch (e) {
      console.log(e);
    }
  };

  const logUserOut = async () => {
    try {
      await CustomStorage.setItem("isLoggedIn", false);
      setIsLoggedIn(false);
    } catch (e) {
      console.log(e);
    }
  };

  return loaded && client && isLoggedIn !== null ? (
    <ApolloProvider client={client}>
      <ThemeProvider theme={styles}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {isLoggedIn === true ? (
            <TouchableOpacity onPress={logUserOut}>
              <Text>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={logUserIn}>
              <Text>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </ThemeProvider>
    </ApolloProvider>
  ) : (
    <AppLoading />
  );
}
