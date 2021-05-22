import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../assets/styles';
import { Card, ErrorComponent, FloatButton, LoadingComponent, MultiItems, NoDataComponent } from '../../components';
import AuthContext from '../../contexts/auth';
import BottomTabBarContext from '../../contexts/bottomTabBar';
import { Hospitalization } from '../../interfaces/hospitalization';
import moment from 'moment';
import { showMessage } from 'react-native-flash-message';
import { getAll, deleteMany } from '../../services/hospitalization';
import HospitalizationIcon from '../../assets/icons/hospitalization.svg';
import NewHospitalizationIcon from '../../assets/icons/new-hospitalization.svg';
import { cutString } from '../../utils/function';

interface MultiSelectItems extends Hospitalization {
  selected: boolean;
}

const HospitalizationList: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { setShowTabBar } = useContext(BottomTabBarContext);
  const [items, setItems] = useState<MultiSelectItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedItemsAmount, setSelectedItemsAmount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    getData();
    navigation.addListener('focus', () => {
      getData();
    });
  }, []);

  useEffect(() => {
    function backAction() {
      if (multiSelect) {
        const updatedArray = items.map(item => {
          item.selected = false;
          setAllSelected(false);
          return item;
        });
        setItems(updatedArray);
        countSelectedItems(updatedArray);
        onCancelSelectionItems();
        return true;
      } else {
        return false;
      }
    }
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [multiSelect, items]);

  async function getData() {
    try {
      const { data } = await getAll(user?.id as string);
      const formattedData = data.map(hospitalization => ({ ...hospitalization, selected: false }));
      setItems(formattedData);
    } catch (error) {
      setHasError(true);
      showMessage({
        message: 'Não consegui listar as suas internações',
        type: 'danger',
        icon: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteItems() {
    const itemsSelected = items.filter(item => item.selected).map(item => item.id);
    setLoading(true);
    try {
      await deleteMany(itemsSelected);
      getData();
      showMessage({
        message: 'Medicamentos excluídos com sucesso!',
        type: 'success',
        icon: 'success',
      });
    } catch {
      showMessage({
        message: 'Não consegui excluir os medicamentos, pode tentar de novo?',
        type: 'danger',
        icon: 'danger',
      });
    } finally {
      onCancelSelectionItems();
    }
  }

  async function onRefresh() {
    await getData();
    showMessage({
      message: 'Lista atualizada!',
      type: 'success',
      icon: 'success',
    });
  }

  function onPressFloatButton() {
    navigation.navigate('NewUserMedicine');
  }

  function onLongPressCard(firstElementIndex: number) {
    setMultiSelect(true);
    setShowTabBar(false);
    const updatedArray = items.map((item, i) => {
      if (i === firstElementIndex) {
        item.selected = true;
        setSelectedItemsAmount(selectedItemsAmount + 1);
      }
      return item;
    });
    setItems(updatedArray);
  }

  function onPressCard(elementIndex: number) {
    if (multiSelect) {
      const updatedArray = items.map((item, i) => {
        if (i === elementIndex) {
          item.selected = !item.selected;
        }
        return item;
      });

      countSelectedItems(updatedArray);
    } else {
      navigation.navigate('UserMedicineDetails', { id: items[elementIndex].id });
    }
  }

  function onPressSelectAllItems() {
    const updatedArray = items.map(item => {
      if (!allSelected) {
        item.selected = true;
        setAllSelected(true);
      } else {
        item.selected = false;
        setAllSelected(false);
      }
      return item;
    });
    setItems(updatedArray);
    countSelectedItems(updatedArray);
  }

  function countSelectedItems(updatedArray: MultiSelectItems[]) {
    const selectedAmount = updatedArray.filter(userDisease => userDisease.selected).length;
    if (selectedAmount === 0) {
      setSelectedItemsAmount(selectedAmount);
    } else {
      if (selectedAmount === items.length) {
        setAllSelected(true);
      } else {
        setAllSelected(false);
      }
      setSelectedItemsAmount(selectedAmount);
      setItems(updatedArray);
    }
  }

  function onCancelSelectionItems() {
    setMultiSelect(false);
    setShowTabBar(true);
    setSelectedItemsAmount(0);
  }

  function renderDateLabel(beginDate: string, endDate?: string) {
    const d1 = moment(beginDate).format('DD/MM/YYYY');
    if (!endDate) {
      return `${d1} - `;
    }

    const d2 = moment(endDate).format('DD/MM/YYYY');
    return `${d1} - ${d2}`;
  }

  function multiItemsText() {
    let value;
    if (selectedItemsAmount === 0) {
      value = 'Selecionar itens';
    } else if (selectedItemsAmount === 1) {
      value = selectedItemsAmount + ' Item selecionado';
    } else {
      value = selectedItemsAmount + ' Itens selecionados';
    }

    return value + '';
  }

  return (
    <SafeAreaView style={styles.container}>
      {!loading && !hasError && items.length > 0 && (
        <>
          <MultiItems
            multiSelect={multiSelect}
            allSelected={allSelected}
            onPressSelectAllItems={onPressSelectAllItems}
            onPressCancel={onCancelSelectionItems}
            onPressDelete={onDeleteItems}
            itemsAmount={selectedItemsAmount}
            selectedItemsText={multiItemsText()}
          >
            <Text style={styles.title}>Minhas internações</Text>
            <View style={styles.scrollContainer}>
              <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
                {items.map((item, i) => (
                  <Card key={i} style={[styles.card, styles.shadow]} onLongPress={() => onLongPressCard(i)} onPress={() => onPressCard(i)}>
                    <View style={styles.textContainer}>
                      <Text style={styles.itemTitle}>{item.location}</Text>
                      <Text style={styles.itemSubTitle}>{cutString(item.reason)}</Text>
                      <Text style={styles.itemSubTitle}>{renderDateLabel(item.entranceDate, item.exitDate)}</Text>
                    </View>
                    {!multiSelect && <HospitalizationIcon width='50' height='50' fill='#000000' />}
                    {multiSelect && (
                      <CheckBox value={item.selected} tintColors={{ true: colors.darkBlue, false: colors.blue }} disabled={true} />
                    )}
                  </Card>
                ))}
              </ScrollView>
            </View>
          </MultiItems>
        </>
      )}
      {!multiSelect && (
        <FloatButton
          icon={<NewHospitalizationIcon width='40' height='70' fill='#fff' />}
          style={styles.floatButton}
          onPress={onPressFloatButton}
        />
      )}
      {loading && <LoadingComponent />}
      {hasError && <ErrorComponent />}
      {!loading && !hasError && items.length === 0 && <NoDataComponent />}
    </SafeAreaView>
  );
};

export default HospitalizationList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.screenColor,
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },

  scrollContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: '71%',
    marginBottom: 95,
  },

  scroll: {
    width: '100%',
    padding: 10,
  },

  card: {
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 20,
  },

  shadow: {
    shadowColor: '#2974FA',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },

  textContainer: {
    justifyContent: 'center',
  },

  itemTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
  },
  itemSubTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastButton: {
    marginTop: 20,
  },

  floatButton: {
    bottom: 100,
    right: 30,
  },
});
