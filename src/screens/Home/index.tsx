import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../assets/styles';
import { LoadingComponent } from '../../components';
import AuthContext from '../../contexts/auth';
import { getUserDiseases } from '../../services/user.disease';

const Home: React.FC = () => {
  const { user, signOut } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function getData() {
    try {
      const { data } = await getUserDiseases(user?.id as string);
    } catch (error) {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={styles.container}>
      {!loading && (
        <>
          <Text>HomePage</Text>
          <TouchableOpacity onPress={signOut}>
            <Text>Sair</Text>
          </TouchableOpacity>
        </>
      )}
      {loading && <LoadingComponent />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.screenColor,
  },
});

export default Home;
